import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'
import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

import { LedStrip } from './LedStrip'
import { User } from './User'
import { Sunset } from './Sunset'
import { Sunrise } from './Sunrise'

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
	readonly id!: ObjectId

	@Property({ unique: true })
	mac!: string

	@Field()
	@Property({ unique: true })
	secret!: string

	@Property()
	pin?: string

	@Field(() => User, { nullable: true })
	@Property({ ref: User })
	owner?: Ref<User>

	@Field({ nullable: true })
	@Property()
	name?: string

	@Field()
	@Property({ default: false })
	isConnected!: boolean

	@Field(() => DeviceEnvironment)
	@Property({ enum: DeviceEnvironment, default: DeviceEnvironment.LIVINGROOM })
	environment!: DeviceEnvironment

	@Field(() => [LedStrip])
	@Property({ type: LedStrip })
	ledStrips!: LedStrip[]

	@Field(() => Sunset)
	@Property({ type: Sunset })
	sunset!: Sunset

	@Field(() => Sunrise)
	@Property({ type: Sunrise })
	sunrise!: Sunrise

}

export const DeviceModel = getModelForClass(Device)