const { gql, ApolloError, withFilter } = require('apollo-server-express')
const { isEmail } = require('validator')

const User = require('../../models/user')

const error = require('../errors')

const typeDefs = gql`
	type User {
		id: ID!
		email: EmailAddress!
		roles: [String!] @requiresAuth(acceptsOnly: [SELF, ROOT])
		firstName: String!
		lastName: String!
		devicesOwning: [Device]! @requiresAuth(acceptsOnly: [SELF, OWNER, ADMIN])
		devicesManaging: [Device]!
			@requiresAuth(acceptsOnly: [SELF, MANAGER, ADMIN])
	}

	input UserInput {
		email: EmailAddress!
		password: String!
		firstName: String!
		lastName: String!
	}
`

const UserResolver = {
	email: async (user, args, context) => {
		const { userByIdLoader } = context

		const userFound = await userByIdLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.email
	},
	roles: async (user, args, context) => {
		const { userByIdLoader } = context

		const userFound = await userByIdLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.roles
	},
	firstName: async (user, args, context) => {
		const { userByIdLoader } = context

		const userFound = await userByIdLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.firstName
	},
	lastName: async (user, args, context) => {
		const { userByIdLoader } = context

		const userFound = await userByIdLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.lastName
	},
	devicesOwning: async (user, args, context) => {
		const { userByIdLoader } = context

		const userFound = await userByIdLoader.load(user.id)
		if (!userFound) {
			return []
		}
		return userFound.devicesOwning
	},
	devicesManaging: async (user, args, context) => {
		const { userByIdLoader } = context

		const userFound = await userByIdLoader.load(user.id)
		if (!userFound) {
			return []
		}
		return userFound.devicesManaging
	},
}

const subscriptionResolvers = {}
const queryResolvers = {}
const mutationResolvers = {}

queryResolvers.user = async (_, { email }, context) => {
	const { userByIdLoader, userByEmailLoader } = context
	let user
	if (email) {
		user = await userByEmailLoader.load(email)
	} else if (context.user) {
		user = await userByIdLoader.load(context.user.id)
	}

	if (!user) {
		return null
	}

	return {
		id: user.id,
	}
}

mutationResolvers.createUser = async (obj, { userInput }, context) => {
	const { userByEmailLoader } = context

	try {
		if (!isEmail(userInput.email)) {
			throw new ApolloError(error.EMAIL_IS_INVALID)
		}

		const existingUser = await userByEmailLoader.load(userInput.email)
		if (existingUser) {
			throw new ApolloError(error.USER_DOES_ALREADY_EXIST)
		}

		const user = new User({
			...userInput,
			roles: ['user'], // default
		})
		await user.save()

		logger.info(`User with email ${user.email} created`, {
			target: 'USER',
			event: 'CREATION_SUCCEEDED',
			meta: { user: user.id, clientIp },
		})

		return { id: user.id }
	} catch (err) {
		throw err
	}
}

mutationResolvers.grantAdmin = async (obj, { email }, context) => {
	const { userByEmailLoader } = context
	const user = await userByEmailLoader.load(email)

	if (!user) {
		throw new ApolloError(error.USER_DOES_NOT_EXIST)
	}

	if (!user.roles.includes('admin')) {
		user.roles.push('admin')
	}

	await user.save()

	return { id: user.id }
}

module.exports = {
	typeDefs,
	subscriptionResolvers,
	queryResolvers,
	mutationResolvers,
	UserResolver,
}
