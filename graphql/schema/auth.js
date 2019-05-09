const { gql } = require('apollo-server')
const { SchemaDirectiveVisitor } = require('graphql-tools')
const bcrypt = require('bcryptjs')

const User = require('../../models/user')
const Device = require('../../models/device')
const { getTokenByUser, getTokenByDevice } = require('../../helpers/token')

const typeDefs = gql`
	directive @requiresAuth(
		rolesAccepted: [Role]
		relationsAccepted: [Relation]
	) on FIELD_DEFINITION

	enum Role {
		USER
		DEVICE
		ADMIN
		ROOT
		DEPLOYER
	}

	enum Relation {
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

	const passwordIsEqual = await bcrypt.compare(password, user.password)
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

	const pinIsEqual = await bcrypt.compare(pin.toString(), device.pin)
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

	const authKeyIsEqual = await bcrypt.compare(authKey, device.authKey)
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
		let { rolesAccepted, relationsAccepted } = this.args

		if (!Array.isArray(rolesAccepted)) rolesAccepted = []
		if (!Array.isArray(relationsAccepted)) relationsAccepted = []

		field.resolve = async (...args) => {
			const [obj, { email, mac }, context] = args
			const id = obj === Object(obj) && obj.id
			let rolesHaving = []

			// Check for roles having
			context.isDeploying && rolesHaving.push('DEPLOYER')
			context.device && rolesHaving.push('DEVICE')

			if (context.user) {
				rolesHaving.push('USER')
				context.user.isAdmin && rolesHaving.push('ADMIN')
				context.user.isRoot && rolesHaving.push('ROOT')
			}

			// Check for the relation having to parent obj
			let relationHaving = null
			if (context.user) {
				if (mac) {
					// A User is trying to acces a Device,
					// we want to find the relation between
					// them:

					const device = await Device.findOne({ mac })
					const isOwningDevice = Boolean(
						context.user.devicesOwning.filter(
							deviceOwning => deviceOwning.id === device.id,
						).length,
					)
					const isManagingDevice = Boolean(
						context.user.devicesManaging.filter(
							deviceManaging => deviceManaging.id === device.id,
						).length,
					)

					if (isOwningDevice) {
						relationHaving = 'OWNER'
					} else if (isManagingDevice) {
						relationHaving = 'MANAGER'
					}
				} else if (id) {
					//! SECURITY ISSUE:
					//! A user trying to access a device with same
					//! id will be treated as `SELF`

					// We got an authorized User trying
					// to access an object with a certain id,
					// Check if this is the User himself:

					const isSelf = id === context.user.id
					if (isSelf) {
						relationHaving = 'SELF'
					}
				}
			} else if (context.device) {
				if (email) {
					// A Device is trying to access a User,
					// we want to find the relation between
					// them:

					const user = await User.findOne({ email })
					const isDeviceOwner = context.device.owner.id === user.id
					const isDeviceManager = Boolean(
						context.device.managers.filter(
							deviceManager => deviceManager.id === user.id,
						),
					)
					if (isDeviceOwner) {
						relationHaving = 'OWNER'
					} else if (isDeviceManager) {
						relationHaving = 'MANAGER'
					}
				} else if (id) {
					//! SECURITY ISSUE:
					//! A Device trying to access a User with same
					//! id will be treated as `SELF`

					// We got an authorized Device trying
					// to access an object with a certain id,
					// Check if this is the Device itself:

					const isSelf = id === context.device.id
					if (isSelf) {
						relationHaving = 'SELF'
					}
				}
			}

			const rolesAreOk =
				!rolesAccepted.length ||
				rolesHaving.filter(roleHaving => rolesAccepted.includes(roleHaving))
					.length

			const relationsAreOk =
				!relationsAccepted.length || relationsAccepted.includes(relationHaving)

			if (!(rolesAreOk || relationsAreOk)) {
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
