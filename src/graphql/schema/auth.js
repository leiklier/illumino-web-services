const { gql } = require('apollo-server')
const { SchemaDirectiveVisitor } = require('graphql-tools')

const User = require('../../models/user')
const Device = require('../../models/device')

const { getTokenByUser, getTokenByDevice } = require('../../lib/token')
const { keepOnlyAlphaNumeric } = require('../../lib/string')

const typeDefs = gql`
	directive @requiresAuth(acceptsOnly: [Role!]) on FIELD_DEFINITION

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
		token: String!
		expiresAt: String!
	}

	type UserAuthData implements AuthData {
		token: String!
		expiresAt: String!
		userId: ID!
	}

	type DeviceAuthData implements AuthData {
		token: String!
		expiresAt: String!
		deviceId: ID!
	}
`

const AuthDataResolver = {
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

const queryResolvers = {}
const mutationResolvers = {}

queryResolvers.loginUser = async (obj, { email, password }) => {
	const user = await User.findOne({ email })

	if (!user) {
		throw new Error('User does not exist!')
	}

	const passwordIsEqual = await user.verifyPassword(password)
	if (!passwordIsEqual) {
		throw new Error('Password is incorrect!')
	}

	const token = getTokenByUser(user, '1h')
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString()

	return { userId: user.id, token, expiresAt }
}

queryResolvers.loginDevice = async (obj, { mac, pin }) => {
	const device = await Device.findOne({ mac })

	if (!device) {
		throw new Error('Device does not exist!')
	}

	if (!device.pin) {
		throw new Error('Pin has not been set yet!')
	}

	const pinIsEqual = await device.verifyPin(pin.toString())
	if (!pinIsEqual) {
		throw new Error('Pin is incorrect!')
	}

	const token = getTokenByDevice(device)
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()

	return { deviceId: device.id, token, expiresAt }
}

queryResolvers.authDevice = async (obj, { mac, authKey }) => {
	const device = await Device.findOne({ mac })

	if (!device) {
		throw new Errow('Device does not exist!')
	}

	const authKeyIsEqual = await device.verifyAuthKey(authKey)
	if (!authKeyIsEqual) {
		throw new Error('authKey is incorrect!')
	}

	const token = getTokenByDevice(device)
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()

	return { deviceId: device.id, token, expiresAt }
}

queryResolvers.isAuth = async (obj, args, context, info) => {
	return context.user || context.device ? true : false
}

queryResolvers.refreshToken = async (obj, args, context) => {
	if (context.user) {
		const token = getTokenByUser(context.user)
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString()

		return { userId: context.user.id, token, expiresAt } // returns UserAuthData
	}

	if (context.device) {
		const token = getTokenByDevice(context.device)
		const expiresAt = new Date(
			Date.now() + 1000 * 60 * 60 * 24 * 7,
		).toISOString()

		return { deviceId: context.device.id, token, expiresAt } // returns DeviceAuthData
	}

	throw new Error('Not logged in!')
}

class RequiresAuthDirective extends SchemaDirectiveVisitor {
	visitFieldDefinition(field) {
		const { resolve = defaultFieldResolver } = field
		const rolesAccepted = this.args.acceptsOnly

		field.resolve = async (...args) => {
			const [obj, { email, mac }, context, info] = args

			const id = obj === Object(obj) && obj.id

			// Strip for [], ! - we are only interested in the type,
			// i.e. `User` and not `[User!]!`:
			const parentType = keepOnlyAlphaNumeric(info.parentType.toString())
			const returnType = keepOnlyAlphaNumeric(info.returnType.toString())

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

			if (context.device && mac) {
				// We are resolving something that takes
				// mac as input, and authorized as `Device`
				if (mac === context.device.mac) {
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
				const user = await User.findOne({ email })
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
				const { deviceLoader } = context
				const device = await deviceLoader.load(id)
				if (device && device.owner && device.owner.id === context.user.id) {
					relationHaving = relation.OWNER
				}
			}

			if (context.user && mac) {
				// We are resolving something that takes
				// mac as input, and authorized as `User`
				const device = await Device.findOne({ mac })
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
				const { managers } = context.device
				const user = await User.findOne({ email })

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
				const { deviceLoader } = context
				const device = (await deviceLoader.load(id)) || {}

				const managers = device.managers || []
				const isManager = managers.filter(
					manager => manager.id === context.user.id,
				).length

				if (isManager) {
					relationHaving = relation.MANAGER
				}
			}

			if (context.user && mac) {
				// We are resolving something which takes
				// mac as input, and authorized as `User`
				const device =
					(await Device.findOne({ mac }).populate('managers')) || {}

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

			if (!(rolesAreOk && context.isAuth)) {
				throw new Error('You are not authorized by requiresAuth!')
			}

			const result = await resolve.apply(this, args)
			return result
		}
	}
}

module.exports = {
	typeDefs,
	queryResolvers,
	mutationResolvers,
	AuthDataResolver,
	RequiresAuthDirective,
}
