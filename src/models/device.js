const mongoose = require('mongoose')
const bcryptPlugin = require('mongoose-bcrypt')

const { Schema } = mongoose

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
			type: String,
			bcrypt: true,
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
	{
		toObject: {
			virtuals: true,
		},
	},
)

deviceSchema.virtual('hasOwner').get(function() {
	return Boolean(this.owner)
})

deviceSchema.plugin(bcryptPlugin)

module.exports = mongoose.model('Device', deviceSchema)
