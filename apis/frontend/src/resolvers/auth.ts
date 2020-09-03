import {
	Resolver,
	Query,
	Args,
	ArgsType,
	Field,
	Ctx,
	Int,
	Mutation,
} from 'type-graphql'
import { DeviceAuthData, UserAuthData } from '../entities/AuthData'
import { DeviceModel, Device } from '../entities/Device'
import { IsUserAlreadyExist } from '../validators/IsUserAlreadyExist'
import { IsDeviceAlreadyExist } from '../validators/IsDeviceAlreadyExist'
import * as error from '../errors'
import { ApolloError } from 'apollo-server-express'
import bcrypt from 'bcrypt'
import {
	getRefreshTokenByDevice,
	getTokenExpiration,
	getAccessTokenByDevice,
	AuthType,
	getAccessTokenByUser,
	getRefreshTokenByUser,
} from '../lib/token'
import { Context } from '../context'
import { IsEmail, Length } from 'class-validator'
import { UserModel } from '../entities/User'

@ArgsType()
class AuthUserArgs {
	@Field()
	@IsEmail()
	@IsUserAlreadyExist()
	email: string

	@Field()
	password: string
}

@ArgsType()
class AuthDeviceArgs {
	@Field()
	@Length(12, 12)
	@IsDeviceAlreadyExist()
	secret: string

	@Field(returns => Int, { nullable: true })
	pin?: number
}

@Resolver()
export default class AuthResolver {
	@Query()
	logout(@Ctx() { req, res }: Context): Boolean {
		const refreshToken = req.cookies['refresh-token']
		if (!refreshToken) return false

		res.cookie('refresh-token', null, {
			maxAge: 1,
			httpOnly: true,
		})

		return true
	}

	@Query(() => UserAuthData)
	async loginUser(
		@Args() { email, password }: AuthUserArgs,
		@Ctx('res') res: Context['res'],
	): Promise<UserAuthData> {
		const user = (await UserModel.findOne({ email }))!

		const passwordIsCorrect = await bcrypt.compare(password, user.password)
		if (!passwordIsCorrect) {
			throw new ApolloError(error.PASSWORD_IS_INCORRECT)
		}

		const authType = AuthType.password
		const accessToken = getAccessTokenByUser(user, authType)
		const refreshToken = getRefreshTokenByUser(user, authType)

		res.cookie('refresh-token', refreshToken, {
			maxAge: getTokenExpiration(refreshToken) - Date.now(),
			httpOnly: true,
		})

		return {
			accessToken,
			user,
		}
	}

	@Query(() => DeviceAuthData)
	async loginDevice(
		@Args() { secret, pin }: AuthDeviceArgs,
		@Ctx('res') res: Context['res'],
	): Promise<DeviceAuthData> {
		const device = (await DeviceModel.findOne({ secret }))!

		if (device.pin && !pin) {
			throw new ApolloError(error.PIN_IS_INVALID)
		}

		if (device.pin) {
			const pinIsCorrect = await bcrypt.compare(pin?.toString(), device.pin)
			if (!pinIsCorrect) {
				throw new ApolloError(error.PIN_IS_INCORRECT)
			}
		}

		const authType = AuthType.pin
		const accessToken = getAccessTokenByDevice(device, authType)
		const refreshToken = getRefreshTokenByDevice(device, authType)

		res.cookie('refresh-token', refreshToken, {
			maxAge: getTokenExpiration(refreshToken) - Date.now(),
			httpOnly: true,
		})

		return {
			accessToken,
			device,
		}
	}

	@Mutation(() => Device)
	async setDevicePin(@Args() { secret, pin }: AuthDeviceArgs): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		const hashedPin = await bcrypt.hash(pin, 12)

		device.pin = hashedPin

		await device.save()
		return device
	}
}
