const { gql } = require('apollo-server-express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const userTypeDefs = gql`
	type User {
		_id: ID!
		email: String!
		password: String
	}
	type AuthData {
		userId: ID!
		token: String!
		tokenExpiration: Int!
	}

	input UserInput {
		email: String!
		password: String!
	}
`

const userResolvers = {
	createUser: async (obj, args, context, info) => {
		try {
			const existingUser = await User.findOne({ email: args.userInput.email })
			if (existingUser) {
				throw new Error('User exists already.')
			}
			const hashedPassword = await bcrypt.hash(args.userInput.password, 12)

			const user = new User({
				email: args.userInput.email,
				password: hashedPassword
			})

			const result = await user.save()

			return { ...result._doc, password: null, _id: result.id }
		} catch (err) {
			throw err
		}
	},
	login: async (obj, { email, password }, context, info) => {
    const user = await User.findOne({ email: email })

		if (!user) {
			throw new Error('User does not exist!')
    }
    
    const isEqual = await bcrypt.compare(password, user.password)
    
		if (!isEqual) {
			throw new Error('Password is incorrect!')
    }
    
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			process.env.JWT_SECRET,
			{
				expiresIn: '1h'
			}
		)
		return { userId: user.id, token, tokenExpiration: 1 }
	}
}

module.exports = {
	userTypeDefs,
	userResolvers
}
