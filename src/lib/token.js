const jwt = require('jsonwebtoken')

const User = require('../models/user')
const Device = require('../models/device')

/**
 * This function creates a signed JWT with a payload containing
 * the `userId` of the `user` provided as input. The
 * token returned is used in e.g. auth.
 *
 * @param {User} user - The User that should be wrapped in the `token`´s payload.
 * @param {string} [expiresIn='1h'] - How long the token should be valid
 * @return {string} The JSON Web Token with userId as payload
 */
const getTokenByUser = (user, expiresIn = '1h') => {
	return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
		expiresIn,
	})
}

/**
 * This function creates a signed JWT with a payload containing
 * the `deviceId` of the `device` provided as input. The
 * token returned is used in e.g. auth.
 *
 * @param {Device} device - The Device that should be wrapped in a token
 * @param {string} [expiresIn='7d'] - How long the token should be valid
 * @return {string} The JSON Web Token with deviceId as payload
 */
const getTokenByDevice = (device, expiresIn = '7d') => {
	return jwt.sign({ deviceId: device.id }, process.env.JWT_SECRET, {
		expiresIn,
	})
}

/**
 * This function extracts a JWT, returns the `User` if `userId` field
 * in tokenPayload is set and `null` otherwise.
 *
 * @param {string} token - A JSON Web Token.
 * @return {User} The `User` with the specified userId stored in JWT (`null` if not existing).
 */
const getUserByToken = async token => {
	try {
		const tokenPayload = jwt.verify(token, process.env.JWT_SECRET) || {}
		if (!tokenPayload.userId) {
			return null
		}

		const user = await User.findOne({ _id: tokenPayload.userId })
			.populate('devicesOwning')
			.populate('devicesManaging')

		return {
			...user.toObject(),
			password: null,
		}
	} catch (err) {
		// Token did invalidate, so no user should be returned.
		return null
	}
}

/**
 * This function extracts a JWT, returns the `Device` if `deviceId` field
 * in tokenPayload is set and `null` otherwise.
 *
 * @param {string} token - A JSON Web Token
 * @return {Device} The `Device` with the specified deviceId stored in JWT (`null` if not existing).
 */
const getDeviceByToken = async token => {
	try {
		const tokenPayload = jwt.verify(token, process.env.JWT_SECRET) || {}
		if (!tokenPayload.deviceId) {
			return null
		}

		const device = await Device.findOne({ _id: tokenPayload.deviceId })
			.populate('owner')
			.populate('managers')

		return {
			...device.toObject(),
			authKey: null,
			pin: null,
		}
	} catch (err) {
		// Token did invalidate, so no device should be returned.
		return null
	}
}

module.exports = {
	getTokenByUser,
	getTokenByDevice,
	getUserByToken,
	getDeviceByToken,
}
