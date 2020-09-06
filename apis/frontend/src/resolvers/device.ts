import {
	Resolver,
	Query,
	Arg,
	FieldResolver,
	Root,
	Args,
	Mutation,
	UseMiddleware,
} from 'type-graphql'
import {
	Device,
	DeviceModel,
	DeviceEnvironment,
	DeviceArgs,
} from '../entities/Device'
import { UserModel, User } from '../entities/User'
import { Auth, Relation } from '../middlewares/auth'
import { AssertDeviceExists } from '../validators/AssertDeviceExists'

@Resolver(of => Device)
export default class DeviceResolver {
	@FieldResolver()
	async owner(@Root() device: Device): Promise<User | null> {
		return await UserModel.findOne({ id: device.owner })
	}

	@Query(returns => Device)
	@AssertDeviceExists()
	async device(@Args() { secret }: DeviceArgs): Promise<Device> {
		return (await DeviceModel.findOne({ secret }))!
	}

	@Mutation(returns => Device)
	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	@AssertDeviceExists()
	async setDeviceName(
		@Args() { secret }: DeviceArgs,
		@Arg('name') name: string,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.name = name
		await device.save()

		return device
	}

	@Mutation(returns => Device)
	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	@AssertDeviceExists()
	async setDeviceEnvironment(
		@Args() { secret }: DeviceArgs,
		@Arg('environment') environment: DeviceEnvironment,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.environment = environment

		await device.save()
		return device
	}
}
