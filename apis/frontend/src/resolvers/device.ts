import { Resolver, Query, Arg, FieldResolver, Root } from 'type-graphql'
import { Device, DeviceModel } from '../entities/Device'
import { UserModel, User } from '../entities/User'

@Resolver(() => Device)
export default class DeviceResolver {
    @FieldResolver()
    async owner(@Root() device: Device): Promise<User|null> {
        return await UserModel.findOne({ id: device.owner })
    }

    @Query(() => Device)
    async device( @Arg('secret') secret: string ): Promise<Device> {
        return (await DeviceModel.findOne({ secret }))!
    }
}