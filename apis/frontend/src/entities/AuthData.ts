import { InterfaceType, ObjectType, Field } from 'type-graphql'
import { User } from './User'
import { Device } from './Device'

@InterfaceType()
export abstract class IAuthData {
    @Field()
    accessToken: string


}

@ObjectType({ implements: IAuthData })
export class UserAuthData extends IAuthData {
    @Field(() => User)
    user: User
}

@ObjectType({ implements: IAuthData })
export class DeviceAuthData extends IAuthData {
    @Field(() => Device)
    device: Device
}      
