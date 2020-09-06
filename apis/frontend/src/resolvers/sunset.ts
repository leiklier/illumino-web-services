import {
	Resolver,
	Mutation,
	Args,
	ArgsType,
	Field,
	UseMiddleware,
} from 'type-graphql'
import { DeviceModel, Device, DeviceArgs } from '../entities/Device'
import { Auth, Relation } from '../middlewares/auth'
import { AssertDeviceExists } from '../validators/AssertDeviceExists'

@ArgsType()
class SunsetArgs extends DeviceArgs {
	@Field()
	startedAt!: Date

	@Field()
	endingAt!: Date
}

@Resolver()
export default class SunsetResolver {
	@Mutation(returns => Device)
	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	@AssertDeviceExists()
	async startSunset(
		@Args() { secret, startedAt, endingAt }: SunsetArgs,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.sunset = { startedAt, endingAt }

		await device.save()
		return device
	}

	@Mutation(returns => Device)
	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	@AssertDeviceExists()
	async stopSunset(
		@Args() { secret, startedAt, endingAt }: SunsetArgs,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.sunset = { startedAt, endingAt }

		await device.save()
		return device
	}
}
