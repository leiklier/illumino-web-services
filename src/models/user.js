const mongoose = require('mongoose')
const bcryptPlugin = require('mongoose-bcrypt')

const { Schema } = mongoose

const userSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
			bcrypt: true,
		},
		roles: {
			// Valid types: user, admin, root
			type: [String],
			required: true,
		},
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		devicesOwning: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Device',
			},
		],
		devicesManaging: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Device',
			},
		],
	},
	{
		toObject: {
			virtuals: true,
		},
	},
)

userSchema.virtual('isAdmin').get(function() {
	return this.roles.includes('admin')
})
userSchema.virtual('isRoot').get(function() {
	return this.roles.includes('root')
})

userSchema.plugin(bcryptPlugin)

module.exports = mongoose.model('User', userSchema)
