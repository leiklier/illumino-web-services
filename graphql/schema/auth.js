const { gql } = require('apollo-server')
const bcrypt = require('bcryptjs')
const User = require('../../models/user')
const { getTokenByUserId } = require('../../helpers')

const authTypeDefs = gql`
    type AuthData {
		userId: ID!
		token: String!
		tokenExpiration: Int!
	}
`

const authResolvers = {
    login: async (obj, { email, password }, context, info) => {
		const user = await User.findOne({ email });

		if (!user) {
			throw new Error('User does not exist!');
		}

		const passwordIsEqual = await bcrypt.compare(password, user.password);
    if (!passwordIsEqual) {
        throw new Error('Password is incorrect!');
    }

		const token = getTokenByUserId(user._id)
		
		return { userId: user.id, token, tokenExpiration: 1 };
    },

    reAuth: async (obj, args, context, info) => {
		const token = getTokenByUserId(context.user._id)
		return {userId: context.user._id, token, tokenExpiration: 1}
	},

	isAuth: async (obj, args, context, info) => {
			return context.user ? true : false
	},

}

module.exports = {
    authTypeDefs,
    authResolvers
}