import { Resolver, Query, Args, ArgsType, Field, Ctx } from 'type-graphql'
import { DeviceAuthData } from '../entities/AuthData'
import { DeviceModel } from '../entities/Device'
import { IsDeviceAlreadyExist } from '../validators/IsDeviceAlreadyExist'
import * as error from '../errors'
import { ApolloError } from 'apollo-server-express'
import bcrypt from 'bcrypt'
import { getRefreshTokenByDevice, getTokenExpiration, getAccessTokenByDevice } from '../lib/token'
import { Context } from '../context'

@ArgsType()
class LoginDeviceInput {
    @Field()
    @IsDeviceAlreadyExist()
    secret: string

    @Field({ nullable: true })
    pin?: string
}


@Resolver()
export default class AuthResolver {

    @Query(() => DeviceAuthData)
    async loginDevice(
        @Args() { secret, pin }: LoginDeviceInput,
        @Ctx('res') res: Context['res'],
    ): Promise<DeviceAuthData> {
        const device = (await DeviceModel.findOne({ secret }))!
        
        if(device.pin && !pin) {
            throw new ApolloError(error.PIN_IS_INVALID)
        }

        if(device.pin) {
            const pinIsCorrect = await bcrypt.compare(pin, device.pin)
            if(!pinIsCorrect) {
                throw new ApolloError(error.PIN_IS_INCORRECT)
            }
        }

        const authType = 'pin'
        const accessToken = getAccessTokenByDevice(device, authType)
        const refreshToken = getRefreshTokenByDevice(device, authType)

        res.cookie('refresh-token', refreshToken, {
            maxAge: getTokenExpiration(refreshToken) - Date.now(),
            httpOnly: true,
        })

        return {
            accessToken,
            device
        }
    }
}