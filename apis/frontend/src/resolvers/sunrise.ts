import { Resolver, Mutation, Args, Arg } from 'type-graphql'
import { Time as TimeInput } from '../entities/Time'
import { Device, DeviceModel } from '../entities/Device'
import { ExistingDeviceArgs } from './device'

@Resolver()
export default class SunriseResolver {
	@Mutation(() => Device)
	async updateSunrise(
		@Args() { secret }: ExistingDeviceArgs,
		@Arg('isActive') isActive: boolean,
		@Arg('startingAt') startingAt: TimeInput,
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
