import mongoose, { Document, Schema, Model } from 'mongoose'
import { IUser } from './user'
import { IDevice } from './device'

export interface IEvent extends Document {
	target: string
	event: string
	message: string
	level: string
	meta: {
		user: IUser['_id']
		device: IDevice['_id']

		errorCode: string
		clientIp: string
	}
}

export interface IEventModel extends Model<IEvent> {
	// Statics:
}

const eventSchema: Schema<IEvent> = new Schema(
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

export default mongoose.model<IEvent, IEventModel>('Event', eventSchema)
