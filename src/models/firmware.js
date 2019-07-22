const doAsync = require('doasync')
const mongoose = require('mongoose')
const db = mongoose.connection
const { createModel } = require('mongoose-gridfs')

let Binary
db.once('open', () => {
	Binary = createModel({
		modelName: 'Binary',
	})
})

const { Schema } = mongoose

const semanticVersionSchema = new Schema(
	{
		major: {
			type: Number,
			required: true,
		},
		minor: {
			type: Number,
			required: true,
		},
		patch: {
			type: Number,
			required: true,
		},
	},
	{ toObject: { virtuals: true } },
)

semanticVersionSchema
	.virtual('string')
	.get(function() {
		return `v${this.major}.${this.minor}.${this.patch}`
	})
	.set(function(versionString) {
		;[this.major, this.minor, this.patch] = versionString
			.substring(1)
			.split('.')
	})

const firmwareSchema = new Schema(
	{
		//* -------------------------------------------------
		//* target and version should together form a unique
		//* identifier `uniqueVersion` for a given `Firmware`
		target: {
			type: String,
			required: true,
		},
		version: {
			type: semanticVersionSchema,
			required: true,
		},
		//* -------------------------------------------------
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		binary: {
			// ObjectId of the GridFS file stored in `binaries.files`
			type: Schema.Types.ObjectId,
			required: true,
		},
	},
	{
		timestamps: true,
		toObject: { virtuals: true },
	},
)

//* NB: This saves the current document, so all required
//* fields should be filled in advance
firmwareSchema.methods.writeBinary = async function(filename, readStream) {
	const session = await db.startSession()
	session.startTransaction()
	try {
		const file = await doAsync(Binary).write({ filename }, readStream)
		this.binary = file._id
		await this.save()
		await session.commitTransaction()
		session.endSession()
	} catch (err) {
		await session.abortTransaction()
		session.endSession()
		// GridFS operations are not done in transactions,
		// so remove manually:
		await doAsync(Binary).unlink(this.binary)
		throw err
	}
}

firmwareSchema.methods.getBinaryReadStream = async function() {
	const readStream = await new Promise((resolve, reject) => {
		Binary.findById(this.binary.toString(), (error, file) => {
			if (error) reject(error)
			resolve(file.read())
		})
	})

	return readStream
}

firmwareSchema.virtual('uniqueVersion').get(function() {
	return `${this.target}+${this.version.string}`
})

firmwareSchema.statics.isLatest = async function(firmware) {
	const latestFirmware = await this.findOne({ target: firmware.target }).sort({
		// descending
		'version.major': -1,
		'version.minor': -1,
		'version.patch': -1,
	})
	if (!latestFirmware) return false

	return latestFirmware.id === firmware.id
}

firmwareSchema.statics.findLatestFirmware = async function(target) {
	const latestFirmware = await this.findOne({ target }).sort({
		// descending
		'version.major': -1,
		'version.minor': -1,
		'version.patch': -1,
	})

	return latestFirmware
}

// TODO:
//  * Add static method for retrieving latest `Firmware`
//*   given a certain target.

// For querying a `Firmware` based on the unique identifier
// target+version (often referred to as 'uniqueVersion')
firmwareSchema.index(
	{
		target: 1,
		'version.major': -1,
		'version.minor': -1,
		'version.patch': -1,
	},
	{ unique: true },
)

module.exports = mongoose.model('Firmware', firmwareSchema)
