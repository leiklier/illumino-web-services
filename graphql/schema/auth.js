const { gql } = require('apollo-server')
const bcrypt = require('bcryptjs')

const User = require('../../models/user')
const Device = require('../../models/device')
const { getTokenByUserId, getTokenByDeviceId } = require('../../helpers')

const authTypeDefs = gql`
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

const authResolvers = {
    loginUser: async (obj, { email, password }, context, info) => {
        // Permittable by all
		const user = await User.findOne({ email });

		if (!user) {
			throw new Error('User does not exist!');
		}

		const passwordIsEqual = await bcrypt.compare(password, user.password);
		if (!passwordIsEqual) {
			throw new Error('Password is incorrect!');
		}

		const token = getTokenByUserId(user.id)
		
		return { userId: user.id, token, tokenExpiration: 1 };
	},
	
	loginDevice: async (obj, { mac, pin }, context, info) => {
        // Permittable by all
		const device = await Device.findOne({ mac })

		if (!device) {
			throw new Error('Device does not exist!')
		}

		const pinIsEqual = await bcrypt.compare(pin.toString(), device.pin)
		if (!pinIsEqual) {
			throw new Error('Pin is incorrect!')
		}

		const token = getTokenByDeviceId(device.id)
		
		return { deviceId: device.id, token, tokenExpiration: 24 * 7 }
	},

    refreshToken: async (obj, args, context, info) => {
		// Permittable by Users and Devices
		if(context.user.isAuth) {
			const token = getTokenByUserId(context.user._id)
			return { userId: context.user._id, token, tokenExpiration: 1 }
		}

        if(context.device.isAuth) {
			const token = getTokenByUserId(context.user._id)
			return { deviceId: context.device._id, token, tokenExpiration: 7 * 24 }
		}
		
		throw new Error('Not logged in!')
	},

	isAuth: async (obj, args, context, info) => {
        // Permittable by all
		return (context.user.isAuth || context.device.isAuth) ? true : false
	},

}

module.exports = {
    authTypeDefs,
    authResolvers
}