const mongoose = require('mongoose')
const { Schema } = mongoose
const bcryptPlugin = require('mongoose-bcrypt')
const SHA256 = require('crypto-js/sha256')

const { DEPLOY_KEY } = process.env

const { semanticVersionSchema } = require('./_schemas')

//* ------------------ LED_STRIP -------------------
const ledStripSchema = new Schema(
	{
		name: {
			type: String,
			default: 'Primary',
		},
		brightness: {
			type: Number,
			required: true,
			min: 0,
			max: 1,
			default: 1,
		},
		color: {
			hue: {
				type: Number,
				required: true,
				min: 0,
				max: 360,
				default: 0,
			},
			saturation: {
				type: Number,
				required: true,
				min: 0,
				max: 1,
				default: 0,
			},
		},
		animation: {
			type: {
				type: String,
				required: true,
				default: 'MANUAL',
			},
			speed: {
				type: Number,
				required: true,
				min: 0,
				max: 1,
				default: 0.5,
			},
		},
	},
	{ toObject: { virtuals: true } },
)

//* ----------------- DEVICE_TYPE ------------------
const deviceTypeSchema = new Schema(
	{
		model: {
			type: String,
			required: true,
		},
		version: {
			type: semanticVersionSchema,
			required: true,
		},
	},
	{ toObject: { virtuals: true } },
)

//* ------------------- DEVICE ---------------------
const deviceSchema = new Schema(
	{
		mac: {
			// MAC Address of default network interface
			type: String,
			required: true,
			unique: true,
		},
		pin: {
			// 6 digit number, used to unlock Device
			// optional sec-feature for `loginDevice`
			// GraphQL query
			type: String,
			bcrypt: true,
		},
		secret: {
			type: 'string',
			required: true,
		},
		type: {
			type: deviceTypeSchema,
			required: true,
		},
		installedFirmware: {
			type: Schema.Types.ObjectId,
			ref: 'Firmware',
			required: true,
		},
		name: String,
		ledStrips: [ledStripSchema],
		isConnected: {
			type: Boolean,
			required: true,
			default: false,
		},
		lastSeenAt: {
			type: Date,
			required: true,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		managers: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		ledStrips: [ledStripSchema],
		ledStripsAreSynced: {
			type: Boolean,
			required: true,
			default: false,
		},
		sunset: {
			startedAt: Date,
			endingAt: Date,
		},
		sunrise: {
			isActive: Boolean,
			startingAt: {
				// Defaults to 07:30
				hour: {
					type: Number,
					required: true,
					min: 0,
					max: 23,
					default: 7,
					validate: {
						validator: Number.isInteger,
						message: '{VALUE} is not an integer value'
					},
				},
				minute: {
					type: Number,
					required: true,
					min: 0,
					max: 59,
					default: 30,
					validate: {
						validator: Number.isInteger,
						message: '{VALUE} is not an integer value'
					},
				},
			},
		},
	},
	{ toObject: { virtuals: true } },
)

deviceSchema.virtual('hasOwner').get(function () {
	return Boolean(this.owner)
})

deviceSchema.virtual('hasPin').get(function () {
	return Boolean(this.pin)
})

deviceSchema.plugin(bcryptPlugin)

module.exports = mongoose.model('Device', deviceSchema)
