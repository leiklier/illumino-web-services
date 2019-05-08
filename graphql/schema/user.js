const { gql } = require('apollo-server')
const { isEmail } = require('validator')
const bcrypt = require('bcryptjs')

const User = require('../../models/user')

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
	id: async (user, _, { userLoader }) => {
		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.id
	},
	email: async (user, _, { userLoader }) => {
		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.email
	},
	roles: async (user, _, { userLoader }) => {
		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.roles
	},
	firstName: async (user, _, { userLoader }) => {
		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.firstName
	},
	lastName: async (user, _, { userLoader }) => {
		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return null
		}
		return userFound.lastName
	},
	devicesOwning: async (user, _, { userLoader }) => {
		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return []
		}
		return userFound.devicesOwning
	},
	devicesManaging: async (user, _, { userLoader }) => {
		const userFound = await userLoader.load(user.id)
		if (!userFound) {
			return []
		}
		return userFound.devicesManaging
	},
}

const queryResolvers = {}
const mutationResolvers = {}

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

mutationResolvers.createUser = async (_, { userInput }) => {
	// Permittable by everyone
	try {
		if (!isEmail(userInput.email)) {
			throw new Error('Invalid email.')
		}

		const existingUser = await User.findOne({ email: userInput.email })
		if (existingUser) {
			throw new Error('User exists already.')
		}

		const hashedPassword = await bcrypt.hash(userInput.password, 12)
		const user = new User({
			...userInput,
			password: hashedPassword,
			roles: ['user'], // default
		})
		await user.save()

		return { id: user.id }
	} catch (err) {
		throw err
	}
}

mutationResolvers.grantAdmin = async (_, { email }) => {
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
	queryResolvers,
	mutationResolvers,
	UserResolver,
}
