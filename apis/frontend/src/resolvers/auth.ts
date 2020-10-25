import {
	Resolver,
	Query,
	Args,
	ArgsType,
	Field,
	Ctx,
	Mutation,
	Int,
} from 'type-graphql'
import { DeviceAuthData, IAuthData, UserAuthData } from '../entities/AuthData'
import { DeviceModel, Device, DeviceArgs } from '../entities/Device'
import { AssertDeviceExists } from '../validators/AssertDeviceExists'
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
	getTokenPayload,
	getAuthTypeByToken,
} from '../lib/token'
import { Context } from '../context'
import { UserModel, UserArgs } from '../entities/User'
import { AssertUserExists } from '../validators/AssertUserExists'

@ArgsType()
class AuthUserArgs extends UserArgs {
	@Field()
	password: string
}

@ArgsType()
class AuthDeviceArgs extends DeviceArgs {
	@Field(type => Int, { nullable: true })
	pin?: number
}

@Resolver()
export default class AuthResolver {
	@Query()
	hasRefreshToken(@Ctx('req') req: Context['req']): Boolean {
		const refreshToken = req.cookies['refresh-token']
		return refreshToken ? true : false
	}

	@Query(returns => IAuthData)
	async accessToken(
		@Ctx('req') req: Context['req'],
	): Promise<UserAuthData | DeviceAuthData> {
		const refreshToken = req.cookies['refresh-token']
		const payload = getTokenPayload(refreshToken)

		const purpose = payload?.purpose
		const userId = payload?.user?.id
		const deviceId = payload?.device?.id
		const authType = getAuthTypeByToken(refreshToken)

		if (purpose !== 'REFRESH' || !authType)
			throw new ApolloError(error.NOT_AUTHENTICATED)

		if (userId) {
			const user = (await UserModel.findById(userId))!
			const accessToken = getAccessTokenByUser(user, authType)

			return {
				user,
				accessToken,
			} // returns UserAuthData
		}

		if (deviceId) {
			const device = (await DeviceModel.findById(deviceId))!
			const accessToken = getAccessTokenByDevice(device, authType)

			return {
				device,
				accessToken,
			} // returns DeviceAuthData
		}

		throw new ApolloError(error.NOT_AUTHENTICATED)
	}

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

	@Query(returns => UserAuthData)
	@AssertUserExists()
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

	@Query(returns => DeviceAuthData)
	@AssertDeviceExists()
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
