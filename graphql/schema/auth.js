const { gql } = require('apollo-server')
const { SchemaDirectiveVisitor } = require('graphql-tools')
const bcrypt = require('bcryptjs')

const User = require('../../models/user')
const Device = require('../../models/device')
const { getTokenByUser, getTokenByDevice } = require('../../helpers/token')

const typeDefs = gql`
	directive @requiresAuth(rolesAccepted: [Role!]! = [USER]) on FIELD_DEFINITION

	enum Role {
		USER
		DEVICE
		DEVICE_OWNER
		DEVICE_MANAGER
		DEVICE_OWNING
		DEVICE_MANAGING
		ADMIN
		ROOT
		DEPLOYER
	}

	interface AuthData {
		token: String!
		tokenExpiration: Int!
	}

	type UserAuthData implements AuthData {
		token: String!
		tokenExpiration: Int!
		userId: ID!
	}

	type DeviceAuthData implements AuthData {
		token: String!
		tokenExpiration: Int!
		deviceId: ID!
	}
`

const AuthDataResolver = {
	__resolveType(authData, context, info) {
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

queryResolvers.loginUser = async (obj, { email, password }, context, info) => {
	const user = await User.findOne({ email })

	if (!user) {
		throw new Error('User does not exist!')
	}

	const passwordIsEqual = await bcrypt.compare(password, user.password)
	if (!passwordIsEqual) {
		throw new Error('Password is incorrect!')
	}

	const token = getTokenByUser(user)

	return { userId: user.id, token, tokenExpiration: 1 }
}

queryResolvers.loginDevice = async (obj, { mac, pin }, context, info) => {
	const device = await Device.findOne({ mac })

	if (!device) {
		throw new Error('Device does not exist!')
	}

	const pinIsEqual = await bcrypt.compare(pin.toString(), device.pin)
	if (!pinIsEqual) {
		throw new Error('Pin is incorrect!')
	}

	const token = getTokenByDevice(device)

	return { deviceId: device.id, token, tokenExpiration: 24 * 7 }
}

queryResolvers.isAuth = async (obj, args, context, info) => {
	// Permittable by all
	return context.user || context.device ? true : false
}

queryResolvers.refreshToken = async (obj, args, context, info) => {
	// Permittable by Users and Devices
	if (context.user) {
		const token = getTokenByUser(context.user)
		return { userId: context.user.id, token, tokenExpiration: 1 } // returns UserAuthData
	}

	if (context.device) {
		const token = getTokenByDevice(context.device)
		return { deviceId: context.device.id, token, tokenExpiration: 7 * 24 } // returns DeviceAuthData
	}

	throw new Error('Not logged in!')
}

class RequiresAuthDirective extends SchemaDirectiveVisitor {
	visitFieldDefinition(field) {
		const { resolve = defaultFieldResolver } = field
		const { rolesAccepted } = this.args

		field.resolve = async (...args) => {
			const [, { mac }, context] = args

			let rolesHaving = []

			context.isDeploying && rolesHaving.push('DEPLOYER')
			context.device && rolesHaving.push('DEVICE')

			if (context.user) {
				rolesHaving.push('USER')
				context.user.isAdmin && rolesHaving.push('ADMIN')
				context.user.isRoot && rolesHaving.push('ROOT')
			}

			if (mac && context.user) {
				const device = await Device.findOne({ mac })

				context.user.devicesOwning.filter(
					deviceOwning => deviceOwning.id === device.id,
				).length && rolesHaving.push('DEVICE_OWNER')

				context.user.devicesManaging.filter(
					deviceManaging => deviceManaging.id === device.id,
				).length && rolesHaving.push('DEVICE_MANAGER')
			}

			if (
				!rolesHaving.filter(roleHaving => rolesAccepted.includes(roleHaving))
					.length
			) {
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
