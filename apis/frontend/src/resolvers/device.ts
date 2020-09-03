import {
	Resolver,
	Query,
	Arg,
	FieldResolver,
	Root,
	Field,
	ArgsType,
	Args,
	Mutation,
	UseMiddleware,
} from 'type-graphql'
import { Device, DeviceModel, DeviceEnvironment } from '../entities/Device'
import { UserModel, User } from '../entities/User'
import { IsDeviceAlreadyExist } from '../validators/IsDeviceAlreadyExist'
import { Length } from 'class-validator'
import { Auth, Relation } from '../middlewares/auth'

@ArgsType()
export class ExistingDeviceArgs {
	@Field()
	@Length(12, 12)
	@IsDeviceAlreadyExist()
	secret: string
}

@Resolver(of => Device)
export default class DeviceResolver {
	@FieldResolver()
	async owner(@Root() device: Device): Promise<User | null> {
		return await UserModel.findOne({ id: device.owner })
	}

	@Query(returns => Device)
	async device(@Arg('secret') secret: string): Promise<Device> {
		return (await DeviceModel.findOne({ secret }))!
	}

	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	@Mutation(returns => Device)
	async setDeviceName(
		@Args() { secret }: ExistingDeviceArgs,
		@Arg('name') name: string,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.name = name
		await device.save()

		return device
	}

	@Mutation(returns => Device)
	async setDeviceEnvironment(
		@Args() { secret }: ExistingDeviceArgs,
		@Arg('environment') environment: DeviceEnvironment,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.environment = environment

		await device.save()
		return device
	}
}
