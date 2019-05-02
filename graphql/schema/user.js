const { gql } = require('apollo-server')
const { isEmail } = require('validator')
const bcrypt = require('bcryptjs')

const User = require('../../models/user')
const { loadUserById } = require('../loaders')

const userTypeDefs = gql`
	type User {
		_id: ID!
		email: String!
		password: String
		roles: [String!]
		firstName: String!
		lastName: String!
		devicesOwning: [Device]!
		devicesManaging: [Device]!
	}

	input UserInput {
		email: String!
		password: String!
		firstName: String!
		lastName: String!
	}
`;

const userResolvers = {
	me: async (obj, args, context, info) => {
		// Permittable by users
		if (!context.user) {
			throw new Error('User not logged in!');
		}

		return user = context.user.isAdmin ? 
			await loadUserById(context.user._id) :
			await loadUserById (context.user._id, 3)
	},

	createUser: async (obj, { userInput }, context, info) => {
		// Permittable by everyone
		try {
			if (!isEmail(userInput.email)) {
				throw new Error('Invalid email.');
			}

			const existingUser = await User.findOne({ email: userInput.email });
			if (existingUser) {
				throw new Error('User exists already.');
			}

			const hashedPassword = await bcrypt.hash(userInput.password, 12);
			const user = new User({
				...userInput,
				password: hashedPassword,
				roles: ['user'] // default
			});
			const result = await user.save();

			return { ...result.toObject(), password: null };
		} catch (err) {
			throw err;
		}
	},

	grantAdmin: async (obj, { email }, context, info) => {
		// Permittable by admins
		if (!context.user) {
			throw new Error('User not logged in!');
		}

		if(!context.user.isAdmin) {
			throw new Error('Requires admin privileges!')
		}

		const user = await User.findOne({ email })

		if(!user) {
			throw new Error('User does not exist!')
		}
	
		if(!user.roles.includes('admin')) {
			user.roles.push('admin')
		}

		await user.save()

		// Admin context, so allow infinite nesting
		return await loadUserById(user.id)
	}
};

module.exports = {
	userTypeDefs,
	userResolvers
};