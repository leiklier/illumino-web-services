import mongoose, { Schema, Document, Model } from 'mongoose'
import { IUser } from './user'
import { IFirmware } from './firmware'
import bcryptPlugin from 'mongoose-bcrypt'

const { semanticVersionSchema } = require('./_schemas')

//* ------------------ LED_STRIP -------------------
declare interface ILedStrip extends Document {
	// Properties
	id: string
	name: string
	brightness: number
	color: {
		hue: number
		saturation: number
	}
	animation: {
		type: string
		speed: number
	}

	// Virtuals:
	hasOwner: boolean
	hasPin: boolean
}


const ledStripSchema: Schema<ILedStrip> = new Schema(
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
export interface IDeviceType extends mongoose.Types.Subdocument {
	// Properties:
	model: string
	version: Object
}

const deviceTypeSchema: Schema<IDeviceType> = new Schema(
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
export interface IDevice extends Document {
	// Properties:
	id: string
	mac: string
	secret: string
	name: string
	environment: string
	pin: string
	type: IDeviceType
	installedFirmware: IFirmware['_id']
	
	isConnected: boolean
	lastSeenAt: Date

	owner: IUser['_id']
	managers: Array<IUser['_id']>
	
	ledStrips: Array<ILedStrip>
	ledStripsAreSynced: boolean
	
	sunset: {
		startedAt: Date
		endingAt: Date
	}
	sunrise: {
		isActive: boolean
		startingAt: {
			hour: number
			minute: number
		}
	}

	// Virtuals:
	hasOwner: boolean
	hasPin: boolean

	// Methods:
	verifyPin(pin: string): Promise<boolean>
}
export interface IDeviceModel extends Model<IDevice> {
	// Statics:
}

const deviceSchema: Schema<IDevice> = new Schema(
	{
		mac: {
			// MAC Address of default network interface
			type: String,
			required: true,
			unique: true,
		},
		secret: {
			type: String,
			required: true,
		},
		name: String,
		environment: {
			type: String,
			required: true,
			default: 'Bedroom'
		},
		pin: {
			// 6 digit number, used to unlock Device
			// optional sec-feature for `loginDevice`
			// GraphQL query
			type: String,
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

export default mongoose.model<IDevice, IDeviceModel>('Device', deviceSchema)
