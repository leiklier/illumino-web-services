import doAsync from 'doasync'
import mongoose , { Document, Types, Schema, Model } from 'mongoose'
const db = mongoose.connection
import { createModel } from 'mongoose-gridfs'
import { semanticVersionSchema, ISemanticVersion } from './_schemas'

let Binary
db.once('open', () => {
	Binary = createModel({
		modelName: 'Binary',
	})
})

export interface IFirmware extends Document {
	// Properties
	target: string
	version: ISemanticVersion
	name: string
	description: string
	binary: Types.ObjectId

	// Virtuals
	uniqueVersion: string
	
	// Methods
	writeBinary(filename: string, readStream: any): void
	getBinaryReadStream(): Promise<any>
	
	
}

export interface IFirmwareModel extends Model<IFirmware> {
	// Statics
	isLatest(firmware: IFirmware): Promise<boolean>
	findLatestFirmware(target: string): IFirmware
}

const firmwareSchema: Schema<IFirmware> = new Schema(
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

firmwareSchema.statics.isLatest = async function(firmware: IFirmware) {
	const latestFirmware = await this.findOne({ target: firmware.target }).sort({
		// descending
		'version.major': -1,
		'version.minor': -1,
		'version.patch': -1,
	})
	if (!latestFirmware) return false

	return latestFirmware.id === firmware.id
}

firmwareSchema.statics.findLatestFirmware = async function(target: string) {
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

export default mongoose.model<IFirmware, IFirmwareModel>('Firmware', firmwareSchema)
