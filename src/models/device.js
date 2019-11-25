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
			min: 0,
			max: 1,
			default: 1,
		},
		color: {
			red: {
				type: Number,
				validator: Number.isInteger,
				message: '{VALUE} is not an integer value',
				min: 0,
				max: 255,
				default: 0,
			},
			green: {
				type: Number,
				validator: Number.isInteger,
				message: '{VALUE} is not an integer value',
				min: 0,
				max: 255,
				default: 0,
			},
			blue: {
				type: Number,
				validator: Number.isInteger,
				message: '{VALUE} is not an integer value',
				min: 0,
				max: 255,
				default: 0,
			},
		},
		animation: {
			type: {
				type: String,
				enum: ['MANUAL', 'LAVA', 'RAINBOW', 'SUNRISE', 'SUNSET'],
				default: 'MANUAL',
			},
			speed: {
				type: Number,
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
		authKey: {
			// Used by Device to authenticate itself
			type: String,
			required: true,
			bcrypt: true,
		},
		pin: {
			// 4 digit number, used to unlock Device
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
	},
	{ toObject: { virtuals: true } },
)

deviceSchema.pre('validate', function() {
	this.secret = SHA256(this.mac + DEPLOY_KEY)
		.toString()
		.substr(0, 12)
})

deviceSchema.virtual('hasOwner').get(function() {
	return Boolean(this.owner)
})

deviceSchema.virtual('hasPin').get(function() {
	return Boolean(this.pin)
})

deviceSchema.plugin(bcryptPlugin)

module.exports = mongoose.model('Device', deviceSchema)
