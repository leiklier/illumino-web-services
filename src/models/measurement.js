const mongoose = require('mongoose')
const { Schema } = mongoose

const measurementSchema = new Schema(
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
	{ timestamps: true },
)

measurementSchema.statics.findLatestMeasurements = async function(device) {
	let measurements = await this.aggregate([
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
		measurements[i] = {
			...measurement,
			_id: measurement.id,
			id: measurement.id.toString(),
		}
	}

	return measurements
}

// For querying a measurement based on device,
// and also querying min/max of a certain type
measurementSchema.index({ device: 1, type: 1, environment: 1, createdAt: 1 })

module.exports = mongoose.model('Measurement', measurementSchema)
