const mongoose = require('mongoose')
const { Schema } = mongoose

const eventSchema = new Schema(
	{
		target: {
			type: String,
			enum: ['SERVER', 'USER', 'DEVICE', 'FIRMWARE'],
			required: true,
		},
		event: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		level: {
			type: String,
			required: true,
		},
		meta: {
			user: {
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
			device: {
				type: Schema.Types.ObjectId,
				ref: 'Device',
			},
			errorCode: String,
			clientIp: String,
		},
	},
	{
		timestamps: true,
	},
)

module.exports = mongoose.model('Event', eventSchema)
