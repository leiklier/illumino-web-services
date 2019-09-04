const mongoose = require('mongoose')
const { Schema } = mongoose
const bcryptPlugin = require('mongoose-bcrypt')
const SHA256 = require('crypto-js/sha256')

const { DEPLOY_KEY } = process.env

const { semanticVersionSchema } = require('./_schemas')

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
			// 12 first chars of SHA256(mac + deployKey)
			// Used in `loginDevice` GraphQL query
			type: String,
			required: true,
			bcrypt: true,
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
	},
	{ toObject: { virtuals: true } },
)

deviceSchema.virtual('hasOwner').get(function() {
	return Boolean(this.owner)
})

// Generate `Device.secret` when new `Device` has been created
deviceSchema.pre('validate', function(next) {
	if (!this.isNew) next()

	this.secret = SHA256(this.mac + DEPLOY_KEY)
		.toString()
		.substr(0, 12)

	next()
})

deviceSchema.plugin(bcryptPlugin)

module.exports = mongoose.model('Device', deviceSchema)
