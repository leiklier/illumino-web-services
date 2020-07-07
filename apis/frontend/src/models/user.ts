import mongoose, { Document, Types, Schema } from 'mongoose'
import { IDevice } from './device'
import bcryptPlugin from 'mongoose-bcrypt'

export interface IUser extends Document {
	// Properties:
	email: string
	password: string
	roles: Array<string>
	firstName: string
	lastName: string
	devicesOwning: Array<IDevice['_id']>
	devicesManaging: Array<IDevice['_id']>

	// Virtuals:
	isAdmin: boolean
	isRoot: boolean
}

const userSchema: Schema<IUser> = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
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

export default mongoose.model<IUser>('User', userSchema)
