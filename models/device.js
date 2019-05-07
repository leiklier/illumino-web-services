const mongoose = require('mongoose')

const Schema = mongoose.Schema

const deviceSchema = new Schema(
	{
		mac: {
			// MAC Address of default network interface
			type: String,
			unique: true,
			required: true,
		},
		authKey: {
			// Used by Device to authenticate itself
			type: String,
			required: true,
		},
		pin: String, // 4 digit number, used to unlock Device
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

module.exports = mongoose.model('Device', deviceSchema)
