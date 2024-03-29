import { gql, ApolloError } from 'apollo-server-express'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import logger from '../../logger'
import Device from '../../models/device'
import { 
	getRefreshTokenByUser,
	getAccessTokenByUser,
	getRefreshTokenByDevice,
	getAccessTokenByDevice,
	tokenIsValid,
	getTokenPayload,
	getTokenExpiration,
	getAuthTypeByToken,
} from '../../lib/token'
import { keepOnlyAlphaNumeric } from '../../lib/string'
import * as error from '../errors'

export const typeDefs = gql`
	directive @requiresAuth(
		acceptsOnly: [Role!]
		cannotBeHuman: Boolean
	) on FIELD_DEFINITION

	enum Role {
		USER
		DEVICE
		ADMIN
		ROOT
		DEPLOYER
		SELF
		OWNER
		MANAGER
	}

	interface AuthData {
		accessToken: String!
		expiresAt: String!
	}

	type UserAuthData implements AuthData {
		accessToken: String!
		expiresAt: String!
		userId: ID!
	}

	type DeviceAuthData implements AuthData {
		accessToken: String!
		expiresAt: String!
		deviceId: ID!
	}
`

export const AuthDataResolver = {
	__resolveType(authData, context) {
		if (authData.userId) {
			return 'UserAuthData'
		}

		if (authData.deviceId) {
			return 'DeviceAuthData'
		}

		return null
	},
}

export const queryResolvers = {
	logout: async (obj, args, context) => {
		const { req, res } = context
	
		const refreshToken = req.cookies['refresh-token']
		if (!refreshToken) return false
	
		res.cookie('refresh-token', null, {
			maxAge: 1,
			httpOnly: true,
		})
		return true
	},

	loginUser: async (obj, { email, password }, context) => {
		const { userByEmailLoader, clientIp, res } = context
		const user = await userByEmailLoader.load(email)
	
		if (!user) {
			logger.warn(`Non-existing user with email ${user.email} tried to login`, {
				target: 'USER',
				event: 'LOGIN_FAILED',
				meta: { errorCode: error.USER_DOES_NOT_EXIST, clientIp },
			})
			throw new ApolloError(error.USER_DOES_NOT_EXIST)
		}
	
		const passwordIsCorrect = await user.verifyPassword(password)
		if (!passwordIsCorrect) {
			logger.error(
				`User with email ${user.email} tried to login with wrong password`,
				{
					target: 'USER',
					event: 'LOGIN_FAILED',
					meta: {
						user: user.id,
						errorCode: error.PASSWORD_IS_INCORRECT,
						clientIp,
					},
				},
			)
			throw new ApolloError(error.PASSWORD_IS_INCORRECT)
		}
	
		const accessToken = getAccessTokenByUser(user, 'password')
		const refreshToken = getRefreshTokenByUser(user, 'password')
	
		res.cookie('refresh-token', refreshToken, {
			maxAge: getTokenExpiration(refreshToken) - Date.now(),
			httpOnly: true,
		})
	
		logger.info(`User with email ${user.email} logged in`, {
			target: 'USER',
			event: 'LOGIN_SUCCEEDED',
			meta: { user: user.id, clientIp },
		})
	
		return {
			userId: user.id,
			accessToken,
			expiresAt: getTokenExpiration(accessToken),
		}
	},

	loginDevice: async (obj, { secret, pin }, context) => {
		const { clientIp, res } = context
	
		const device = await Device.findOne({ secret })
	
		if (!device) {
			logger.warn(
				`Non-existing device with secret ${device.secret} tried to login`,
				{
					target: 'DEVICE',
					event: 'LOGIN_FAILED',
					meta: { errorCode: error.DEVICE_DOES_NOT_EXIST, clientIp },
				},
			)
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		if (device.pin && !pin) {
			logger.warn(
				`Device with secret ${
				device.secret
				} tried to login without pin, but pin is required`,
				{
					target: 'DEVICE',
					event: 'LOGIN_FAILED',
					meta: { device: device.id, errorCode: error.PIN_IS_INVALID, clientIp },
				},
			)
			throw new ApolloError(error.PIN_IS_INVALID)
		}
	
		if (device.pin) {
			const pinIsCorrect = await device.verifyPin(pin.toString())
			if (!pinIsCorrect) {
				logger.warn(
					`Device with secret ${device.secret} tried to login with wrong pin`,
					{
						target: 'DEVICE',
						event: 'LOGIN_FAILED',
						meta: {
							device: device.id,
							errorCode: error.PIN_IS_INCORRECT,
							clientIp,
						},
					},
				)
				throw new ApolloError(error.PIN_IS_INCORRECT)
			}
		}
	
		const accessToken = getAccessTokenByDevice(device, 'pin')
		const refreshToken = getRefreshTokenByDevice(device, 'pin')
	
		res.cookie('refresh-token', refreshToken, {
			maxAge: getTokenExpiration(refreshToken) - Date.now(),
			httpOnly: true,
		})
	
		logger.info(`Device with secret ${device.secret} logged in`, {
			target: 'DEVICE',
			event: 'LOGIN_SUCCEEDED',
			meta: { device: device.id, clientIp },
		})
	
		return {
			deviceId: device.id,
			accessToken,
			expiresAt: getTokenExpiration(accessToken),
		}
	},

	isAuth: async (obj, args, context, info) => {
		return context.user || context.device ? true : false
	},

	hasRefreshToken: async (obj, args, context) => {
		const { req } = context
		const refreshToken = req.cookies['refresh-token']
		if (!refreshToken) return false
		return tokenIsValid(refreshToken)
	},

	accessToken: async (obj, args, context) => {
		const { clientIp, req } = context
		const refreshToken = req.cookies['refresh-token']
		const { user, device, purpose } = getTokenPayload(refreshToken)
		const authType = getAuthTypeByToken(refreshToken)
	
		if (purpose !== 'REFRESH') throw new ApolloError(error.NOT_AUTHENTICATED)
	
		if (user) {
			const accessToken = getAccessTokenByUser(user, authType)
	
			logger.info(`User with email ${user.email} refreshed token`, {
				target: 'USER',
				event: 'TOKEN_REFRESH_SUCCEEDED',
				meta: { user: user.id, clientIp },
			})
	
			return {
				userId: user.id,
				accessToken,
				expiresAt: getTokenExpiration(accessToken),
			} // returns UserAuthData
		}
	
		if (device) {
			const accessToken = getAccessTokenByDevice(device, authType)
	
			logger.info(`Device with secret ${device.secret} refreshed token`, {
				target: 'DEVICE',
				event: 'TOKEN_REFRESH_SUCCEEDED',
				meta: { device: device.id, clientIp },
			})
	
			return {
				deviceId: device.id,
				accessToken,
				expiresAt: getTokenExpiration(accessToken)
			} // returns DeviceAuthData
		}
	
		throw new ApolloError(error.NOT_AUTHENTICATED)
	}
}

export const mutationResolvers = {}

export class RequiresAuthDirective extends SchemaDirectiveVisitor {
	visitFieldDefinition(field) {
		// @ts-ignore
		const { resolve = defaultFieldResolver } = field

		const { cannotBeHuman } = this.args
		const rolesAccepted = this.args.acceptsOnly || []

		field.resolve = async (...args) => {
			const [obj, { email, secret }, context, info] = args

			const id = obj === Object(obj) && obj.id

			// Strip for [], ! - we are only interested in the type,
			// i.e. `User` and not `[User!]!`:
			const parentType = keepOnlyAlphaNumeric(info.parentType.toString())

			// ******************************
			// ********** ROLES *************
			// ******************************
			let rolesHaving = []

			context.isDeploying && rolesHaving.push('DEPLOYER')
			context.device && rolesHaving.push('DEVICE')

			if (context.user) {
				rolesHaving.push('USER')
				context.user.isAdmin && rolesHaving.push('ADMIN')
				context.user.isRoot && rolesHaving.push('ROOT')
			}

			// ******************************
			// ********* RELATION ***********
			// ******************************
			const relation = {
				SELF: 'SELF',
				OWNER: 'OWNER',
				MANAGER: 'MANAGER',
			}

			let relationHaving = null

			// * SELF
			// * * Device
			if (context.device && parentType === 'Device') {
				// We are resolving the fields of a `Device`,
				// and we are authorized as a `Device`
				if (id === context.device.id) {
					relationHaving = relation.SELF
				}
			}

			if (context.device && secret) {
				// We are resolving something that takes
				// secret as input, and authorized as `Device`
				if (secret === context.device.secret) {
					relationHaving = relation.SELF
				}
			}

			// * * User
			if (context.user && parentType === 'User') {
				// We are resolving the fields of a `User`,
				// and we are authorized as a `User`
				if (id === context.user.id) {
					relationHaving = relation.SELF
				}
			}

			if (context.user && email) {
				// We are resolving something that takes
				// email as input, and authorized as `User`
				if (email === context.user.email) {
					relationHaving = relation.SELF
				}
			}

			// * OWNER
			// * * Device
			if (context.device && parentType === 'User') {
				// We are resolving the fields of a `User`,
				// and we are authorized as a `Device`
				if (context.device.owner.id === id) {
					relationHaving = relation.OWNER
				}
			}

			if (context.device && email) {
				// We are resolving something that takes
				// email as input, and authorized as `Device`
				const { userByEmailLoader } = context
				const user = await userByEmailLoader.load(email)
				if (
					user &&
					context.device.owner &&
					context.device.owner.id === user.id
				) {
					relationHaving = relation.OWNER
				}
			}

			// * * User
			if (context.user && parentType === 'Device') {
				// We are resolving the fields of a `Device`,
				// and we are authorized as a `User`
				const { deviceByIdLoader } = context
				const device = await deviceByIdLoader.load(id)

				if (device && device.owner && device.owner.id === context.user.id) {
					relationHaving = relation.OWNER
				}
			}

			if (context.user && secret) {
				// We are resolving something that takes
				// secret as input, and authorized as `User`
				const { deviceBySecretLoader } = context
				const device = await deviceBySecretLoader.load(secret)

				if (device && device.owner && device.owner.id === context.user.id) {
					relationHaving = relation.OWNER
				}
			}

			// * MANAGER
			// * * Device
			if (context.device && parentType === 'User') {
				// We are resolving the fields of a `User`,
				// and we are authorized as a `Device`
				const { managers } = context.device
				const isManager = managers.filter(manager => manager.id === id).length
				if (isManager) {
					relationHaving = relation.MANAGER
				}
			}

			if (context.device && email) {
				// We are resolving something which takes
				// email as input, and authorized as `Device`
				const { userByEmailLoader } = context
				const user = await userByEmailLoader.load(email)

				const { managers } = context.device
				const isManager = managers.filter(manager => manager.id === user.id)
					.length

				if (isManager) {
					relationHaving = relation.MANAGER
				}
			}

			// * * User
			if (context.user && parentType === 'Device') {
				// We are resolving the fields of a `Device`,
				// and we are authorized as a `User`
				const { deviceByIdLoader } = context
				const device = (await deviceByIdLoader.load(id)) || {}

				const managers = device.managers || []
				const isManager = managers.filter(
					manager => manager.id === context.user.id,
				).length

				if (isManager) {
					relationHaving = relation.MANAGER
				}
			}

			if (context.user && secret) {
				// We are resolving something which takes
				// secret as input, and authorized as `User`
				const { deviceBySecretLoader } = context
				const device = (await deviceBySecretLoader.load(secret)) || {}

				const managers = device.managers || []
				const isManager = managers.filter(
					manager => manager.id === context.user.id,
				).length

				if (isManager) {
					relationHaving = relation.MANAGER
				}
			}

			// ******************************
			// ***** CHECK REQUIREMENTS *****
			// ******************************
			rolesHaving.push(relationHaving)

			const rolesAreOk =
				!rolesAccepted.length ||
				rolesHaving.filter(roleHaving => rolesAccepted.includes(roleHaving))
					.length

			if (!context.isAuth) {
				throw new ApolloError(error.NOT_AUTHENTICATED)
			}

			if (!rolesAreOk) {
				throw new ApolloError(error.NOT_AUTHORIZED)
			}

			if (
				cannotBeHuman &&
				//           ,---- The only authTypes that don't accept humans
				!['authKey', 'deployKey'].includes(context.authType)
			) {
				throw new ApolloError(error.NOT_AUTHORIZED)
			}

			const result = await resolve.apply(this, args)
			return result
		}
	}
}
