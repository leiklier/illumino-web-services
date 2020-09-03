import { Resolver, Mutation, Int, Args, ArgsType, Field } from 'type-graphql'
import { DeviceModel, Device } from '../entities/Device'
import * as error from '../errors'
import { ApolloError } from 'apollo-server-express'
import { IsDeviceAlreadyExist } from '../validators/IsDeviceAlreadyExist'
import { Length } from 'class-validator'

@ArgsType()
class SunsetArgs {
	@Field()
	@Length(12, 12)
	@IsDeviceAlreadyExist()
	secret!: string

	@Field(() => Int, { nullable: true })
	ledStripIndex!: number

	@Field()
	startedAt!: Date

	@Field()
	endingAt!: Date
}

@Resolver()
export default class SunsetResolver {
	@Mutation(() => Device)
	async startSunset(
		@Args() { secret, ledStripIndex, startedAt, endingAt }: SunsetArgs,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}

		device.sunset = { startedAt, endingAt }

		await device.save()
		return device
	}

	@Mutation(() => Device)
	async stopSunset(
		@Args() { secret, ledStripIndex, startedAt, endingAt }: SunsetArgs,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}

		device.sunset = { startedAt, endingAt }

		await device.save()
		return device
	}
}
