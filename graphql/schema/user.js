const { gql } = require('apollo-server')
const { isEmail } = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../../models/user')
const { getUserById } = require('../../getters')

const userTypeDefs = gql`
	type User {
		_id: ID!
		email: String!
		password: String
		roles: [String!]
		firstName: String!
		lastName: String!
		ownedDevices: [Device]!
		managedDevices: [Device]!
	}
	type AuthData {
		userId: ID!
		token: String!
		tokenExpiration: Int!
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
		if (!context.user) {
			throw new Error('User not logged in!');
		}
		// Should only be able to get info down to 
		// firstName, lastName, etc. of others managing/owning
		// himself's ownedDevices/managedDevices:
		return user = await getUserById(context.user._id, 3)
	},

	createUser: async (obj, { userInput }, context, info) => {
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

	login: async (obj, { email, password }, context, info) => {
		const user = await User.findOne({ email });

		if (!user) {
			throw new Error('User does not exist!');
		}

		const passwordIsEqual = await bcrypt.compare(password, user.password);

		if (!passwordIsEqual) {
			throw new Error('Password is incorrect!');
		}

		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			process.env.JWT_SECRET,
			{
				expiresIn: '1h'
			}
		);
		return { userId: user.id, token, tokenExpiration: 1 };
	},

	grantAdmin: async (obj, { email }, context, info) => {
		if (!context.user) {
			throw new Error('User not logged in!');
		}

		if(!context.user.roles.includes('admin')) {
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
		return await getUserById(user.id)
	}
};

module.exports = {
	userTypeDefs,
	userResolvers
};