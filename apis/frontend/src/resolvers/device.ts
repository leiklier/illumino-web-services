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
} from 'type-graphql'
import { Device, DeviceModel } from '../entities/Device'
import { UserModel, User } from '../entities/User'
import { IsDeviceAlreadyExist } from '../validators/IsDeviceAlreadyExist'
import { Length } from 'class-validator'

@ArgsType()
export class ExistingDeviceArgs {
	@Field()
	@Length(12, 12)
	@IsDeviceAlreadyExist()
	secret: string
}

@Resolver(() => Device)
export default class DeviceResolver {
	@FieldResolver()
	async owner(@Root() device: Device): Promise<User | null> {
		return await UserModel.findOne({ id: device.owner })
	}

	@Query(() => Device)
	async device(@Arg('secret') secret: string): Promise<Device> {
		return (await DeviceModel.findOne({ secret }))!
	}

	@Mutation(() => Device)
	async setDeviceName(
		@Args() { secret }: ExistingDeviceArgs,
		@Arg('name') name: string,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.name = name
		await device.save()

		return device
	}
}
