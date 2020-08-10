import { Resolver, Query, Arg } from 'type-graphql'
import { Device, DeviceModel } from '../entities/Device'

@Resolver()
export default class DeviceResolver {
    @Query(() => Device)
    async device(
        @Arg('secret')
        secret: string
    ): Promise<Device> {
        return (await DeviceModel.findOne({ secret }))!
    }
}