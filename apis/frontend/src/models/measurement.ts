import mongoose, { Document, Schema, Model } from 'mongoose'
import { IDevice } from './device'

export interface IMeasurement extends Document {
	// Properties
	device: IDevice['_id']
	type: string
	environment: string
	value: number
	
	
}

export interface IMeasurementModel extends Model<IMeasurement> {
	// Statics: 
	findLatestMeasurements(device: IDevice): Promise<Array<IMeasurement>>
}

const measurementSchema: Schema<IMeasurement> = new Schema(
	{
		device: {
			type: Schema.Types.ObjectId,
			ref: 'Device',
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		environment: {
			type: String,
			required: false,
		},
		value: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
		toObject: { virtuals: true },
	},
)

measurementSchema.statics.findLatestMeasurements = async function(device: IDevice): Promise<Array<IMeasurement>> {
	let measurements: Array<IMeasurement> = await this.aggregate([
		{
			$match: {
				device: device._id,
			},
		},
		{
			$sort: {
				type: 1,
				environment: 1,
				createdAt: 1,
			},
		},
		{
			$group: {
				_id: {
					type: '$type',
					environment: '$environment',
				},
				// pass _id down as id since we had
				// to use _id field for grouping:
				id: { $last: '$_id' },

				// All fields from schema should be listed here
				// TODO: Make this dynamic
				device: { $last: '$device' },
				type: { $last: '$type' },
				environment: { $last: '$environment' },
				value: { $last: '$value' },
			},
		},
	])

	// Moving id back to _id:
	for (const [i, measurement] of measurements.entries()) {
		measurements[i]._id = measurement.id
		measurements[i].id = measurement.id.toString()
	}

	return measurements
}

// For querying a measurement based on device,
// and also querying min/max of a certain type
measurementSchema.index({ device: 1, type: 1, environment: 1, createdAt: 1 })

export default mongoose.model<IMeasurement, IMeasurementModel>('Measurement', measurementSchema)
