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

const firmwareSchema = new Schema(
	{
		target: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		version: {
			type: String,
			required: true,
			unique: true,
		},
		binary: {
			// ObjectId of the GridFS file stored in `binaries.files`
			type: Schema.Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true },
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

firmwareSchema.virtual('binaryBuffer').get(async function() {
	const content = await new Promise((resolve, reject) => {
		Binary.findById(this.binary.toString(), (error, readStream) => {
			if (error) reject(error)
			readStream.read((error, content) => {
				if (error) reject(error)
				resolve(content)
				return content
			})
		})
	})

	return content
})

module.exports = mongoose.model('Firmware', firmwareSchema)
