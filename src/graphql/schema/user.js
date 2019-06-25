const { gql, withFilter } = require('apollo-server')
const { isEmail } = require('validator')

const User = require('../../models/user')

const pubsub = require('../pubsub')

const typeDefs = gql`
	type User {
		id: ID!
		email: String!
		roles: [String!]
			@requiresAuth(rolesAccepted: [ROOT], relationsAccepted: [SELF])
		firstName: String!
		lastName: String!
		devicesOwning: [Device]!
			@requiresAuth(rolesAccepted: [ADMIN], relationsAccepted: [SELF])
		devicesManaging: [Device]!
			@requiresAuth(rolesAccepted: [ADMIN], relationsAccepted: [SELF])
	}

	input UserInput {
		email: String!
		password: String!
		firstName: String!
		lastName: String!
	}
`

const UserResolver = {
	email: async (user, args, context) => {
		const { userLoader } = context

		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.email
	},
	roles: async (user, args, context) => {
		const { userLoader } = context

		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.roles
	},
	firstName: async (user, args, context) => {
		const { userLoader } = context

		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.firstName
	},
	lastName: async (user, args, context) => {
		const { userLoader } = context

		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.lastName
	},
	devicesOwning: async (user, args, context) => {
		const { userLoader } = context

		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return []
		}
		return userFound.devicesOwning
	},
	devicesManaging: async (user, args, context) => {
		const { userLoader } = context

		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return []
		}
		return userFound.devicesManaging
	},
}

const subscriptionResolvers = {}
const queryResolvers = {}
const mutationResolvers = {}

subscriptionResolvers.user = {
	subscribe: withFilter(
		() => pubsub.asyncIterator('user'),
		(payload, variables) => {
			return payload.user.email === variables.email
		},
	),
}

queryResolvers.user = async (_, { email }, context) => {
	let user
	if (email) {
		user = await User.findOne({ email })
	} else {
		user = await User.findOne({ _id: context.user.id })
	}

	if (!user) {
		return null
	}

	return {
		id: user.id,
	}
}

mutationResolvers.createUser = async (obj, { userInput }) => {
	// Permittable by everyone
	try {
		if (!isEmail(userInput.email)) {
			throw new Error('Invalid email.')
		}

		const existingUser = await User.findOne({ email: userInput.email })
		if (existingUser) {
			throw new Error('User exists already.')
		}

		const user = new User({
			...userInput,
			roles: ['user'], // default
		})
		await user.save()

		return { id: user.id }
	} catch (err) {
		throw err
	}
}

mutationResolvers.grantAdmin = async (obj, { email }) => {
	// Permittable by admins
	const user = await User.findOne({ email })

	if (!user) {
		throw new Error('User does not exist!')
	}

	if (!user.roles.includes('admin')) {
		user.roles.push('admin')
	}

	await user.save()

	// Admin context, so allow infinite nesting
	return { id: user.id }
}

module.exports = {
	typeDefs,
	subscriptionResolvers,
	queryResolvers,
	mutationResolvers,
	UserResolver,
}
