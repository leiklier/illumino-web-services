import { Resolver, Mutation, Args, Arg, ArgsType, Field } from 'type-graphql'
import { Time as TimeInput } from '../entities/Time'
import { Device, DeviceModel, DeviceArgs } from '../entities/Device'
import { AssertDeviceExists } from '../validators/AssertDeviceExists'

@ArgsType()
class SunriseArgs extends DeviceArgs {
	@Field()
	isActive!: boolean

	@Field()
	startingAt!: TimeInput
}

@Resolver()
export default class SunriseResolver {
	@Mutation(() => Device)
	@AssertDeviceExists()
	async updateSunrise(
		@Args() { secret, isActive, startingAt }: SunriseArgs,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.sunrise = {
			...device.sunset,
			isActive,
			startingAt,
		}

		await device.save()
		return device
	}
}
