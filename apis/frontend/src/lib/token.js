const jwt = require('jsonwebtoken')

const User = require('../models/user')
const Device = require('../models/device')

/**
 * This function creates a signed JWT with a payload containing
 * the `userId` of the `user` provided as input. The
 * token returned is used in e.g. auth. purpose: REFRESH
 *
 * @param {User} user - The User that should be wrapped in the `token`´s payload.
 * @param {string} authType - What type of credentials was provided, e.g. 'password'
 * @param {string} expiresAt - When token should expire, number of milliseconds since Epoch
 * @return {string} The JSON Web Token with `userId` and `authType` as payload
 */
const getRefreshTokenByUser = (user, authType) => {
	const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days
	return jwt.sign(
		{
			payload: {
				userId: user.id,
				authType,
				purpose: 'REFRESH',
			},
			exp: Math.floor(parseInt(expiresAt) / 1000),
		},
		process.env.JWT_SECRET,
	)
}

/**
 * This function creates a signed JWT with a payload containing
 * the `userId` of the `user` provided as input. The
 * token returned is used in e.g. auth. purpose: ACCESS
 *
 * @param {User} user - The User that should be wrapped in the `token`´s payload.
 * @param {string} authType - What type of credentials was provided, e.g. 'password'
 * @param {string} expiresAt - When token should expire, number of milliseconds since Epoch
 * @return {string} The JSON Web Token with `userId` and `authType` as payload
 */
const getAccessTokenByUser = (user, authType) => {
	const expiresAt = Date.now() + 1000 * 60 * 60 * 2 // 2 hours
	return jwt.sign(
		{
			payload: {
				userId: user.id,
				authType,
				purpose: 'ACCESS',
			},
			exp: Math.floor(parseInt(expiresAt) / 1000),
		},
		process.env.JWT_SECRET,
	)
}

/**
 * This function creates a signed JWT with a payload containing
 * the `deviceId` of the `device` provided as input. The
 * token returned is used in e.g. auth. purpose: REFRESH
 *
 * @param {Device} device - The Device that should be wrapped in a token
 * @param {string} authType - What type of credentials was provided, e.g. 'pin', 'authKey'
 * @param {string} expiresAt - When token should expire, number of milliseconds since Epoch
 * @return {string} The JSON Web Token with `deviceId` and `authType` as payload
 */
const getRefreshTokenByDevice = (device, authType) => {
	const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days
	return jwt.sign(
		{
			payload: {
				deviceId: device.id,
				authType,
				purpose: 'REFRESH',
			},
			exp: Math.floor(parseInt(expiresAt) / 1000),
		},
		process.env.JWT_SECRET,
	)
}

/**
 * This function creates a signed JWT with a payload containing
 * the `deviceId` of the `device` provided as input. The
 * token returned is used in e.g. auth. purpose: REFRESH
 *
 * @param {Device} device - The Device that should be wrapped in a token
 * @param {string} authType - What type of credentials was provided, e.g. 'pin', 'authKey'
 * @param {string} expiresAt - When token should expire, number of milliseconds since Epoch
 * @return {string} The JSON Web Token with `deviceId` and `authType` as payload
 */
const getAccessTokenByDevice = (device, authType) => {
	const expiresAt = Date.now() + 1000 * 60 * 60 * 2 // 2 hours
	return jwt.sign(
		{
			payload: {
				deviceId: device.id,
				authType,
				purpose: 'ACCESS',
			},
			exp: Math.floor(parseInt(expiresAt) / 1000),
		},
		process.env.JWT_SECRET,
	)
}

/**
 * This function extracts a JWT, returns the `User` if `userId` field
 * in tokenPayload is set and `null` otherwise.
 *
 * @param {string} token - A JSON Web Token.
 * @return {Object} an object with key `payload`, which contains `userId` stored in JWT (`null` if not existing) and `authType`.
 */
const getUserByToken = async token => {
	try {
		const decryptedToken = jwt.verify(token, process.env.JWT_SECRET) || {}
		const tokenPayload = decryptedToken.payload || {}

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
 * @return {Object} an object with key `payload`, which contains `deviceId` stored in JWT (`null` if not existing) and `authType`.
 */
const getDeviceByToken = async token => {
	try {
		const decryptedToken = jwt.verify(token, process.env.JWT_SECRET) || {}
		const tokenPayload = decryptedToken.payload || {}

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

const tokenIsValid = token => {
	try {
		const decryptedToken = jwt.verify(token, process.env.JWT_SECRET)
		if (!decryptedToken) return false
		return true
	} catch (err) {
		return false
	}
}

const getTokenPayload = token => {
	try {
		const decryptedToken = jwt.verify(token, process.env.JWT_SECRET) || {}
		const tokenPayload = decryptedToken.payload || {}
		return tokenPayload
	} catch (err) {
		// Token did invalidate
		return {}
	}
}

const getTokenExpiration = token => {
	const decodedToken = jwt.decode(token)
	return decodedToken.exp * 1000
}

const getAuthTypeByToken = token => {
	try {
		const decryptedToken = jwt.verify(token, process.env.JWT_SECRET) || {}
		const tokenPayload = decryptedToken.payload || {}

		return tokenPayload.authType
	} catch (err) {
		// Token did invalidate
		return null
	}
}

module.exports = {
	getRefreshTokenByUser,
	getAccessTokenByUser,
	getRefreshTokenByDevice,
	getAccessTokenByDevice,

	getUserByToken,
	getDeviceByToken,

	tokenIsValid,

	getTokenPayload,
	getTokenExpiration,
	getAuthTypeByToken,
}
