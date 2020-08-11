import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'
import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

import { LedStrip } from './LedStrip'
import { User } from './User'

export enum DeviceEnvironment {
	BEDROOM = 'BEDROOM',
	LIVINGROOM = 'LIVINGROOM',
	GARAGE = 'GARAGE',
	KITCHEN = 'KITCHEN',
}

registerEnumType(DeviceEnvironment, {
	name: 'DeviceEnvironment',
	description: 'Environment in which a Device can be mounted',
})

@ObjectType({ description: 'A physical device of the Illumino Family' })
export class Device {
	@Field(() => ID)
	readonly id: ObjectId

	@Property({ required: true, unique: true })
	mac: string

	@Field()
	@Property({ required: true, unique: true })
	secret: string

	@Property()
	pin?: string

	@Field(() => User, { nullable: true })
	@Property({ type: () => User })
	owner?: Ref<User>

	@Field({ nullable: true })
	@Property()
	name?: string

	@Field()
	@Property({ required: true, default: false })
	isConnected: boolean

	@Field(() => DeviceEnvironment)
	@Property({ required: true, enum: DeviceEnvironment })
	environment: DeviceEnvironment

	@Field(() => [LedStrip])
	@Property({ type: LedStrip })
	ledStrips: LedStrip[]
}

export const DeviceModel = getModelForClass(Device)
