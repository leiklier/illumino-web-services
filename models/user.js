const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema(
	{
		email: {
			type: String,
			unique: true,
			required: true,
		},
		password: {
			type: String,
			required: true,
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

module.exports = mongoose.model('User', userSchema)
