import { InterfaceType, ObjectType, Field } from 'type-graphql'
import { Device } from './Device'

@InterfaceType()
export abstract class IAuthData {
    @Field()
    accessToken: string


}

@ObjectType({ implements: IAuthData })
export class DeviceAuthData implements IAuthData {
    accessToken: string
    
    @Field(() => Device)
    device: Device
}