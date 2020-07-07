import jwt from 'jsonwebtoken'

import { IUser } from '../models/user'
import { IDevice } from '../models/device'


export interface IToken {
	payload: {
		user?: {
			id: string
			email: string
		}
		device?: {
			id: string
			mac: string
			secret: string
		}
		authType: string // TODO
		purpose: 'REFRESH' | 'ACCESS'
	}
	exp: number
}

export const getRefreshTokenByUser = (user: IToken["payload"]["user"], authType: string): string => {
	const expiresAt: number = Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days
	return jwt.sign(
		{
			payload: {
				user: {
					id: user.id,
					email: user.email,
				},
				authType,
				purpose: 'REFRESH',
			},
			exp: Math.floor(expiresAt / 1000),
		},
		process.env.JWT_SECRET,
	)
}

export const getAccessTokenByUser = (user: IToken["payload"]["user"], authType: string): string => {
	const expiresAt: number = Date.now() + 1000 * 60 * 60 * 24 * 10 // 10 days
	return jwt.sign(
		{
			payload: {
				user: {
					id: user.id,
					email: user.email,
				},
				authType,
				purpose: 'ACCESS',
			},
			exp: Math.floor(expiresAt / 1000),
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
 * @return {string} The JSON Web Token
 */
export const getRefreshTokenByDevice = (device: IToken["payload"]["device"], authType: string): string => {
	const expiresAt: number = Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days
	return jwt.sign(
		{
			payload: {
				device: {
					id: device.id,
					mac: device.mac,
					secret: device.secret,
				},
				authType,
				purpose: 'REFRESH',
			},
			exp: Math.floor(expiresAt / 1000),
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
 * @return {string} The JSON Web Token
 */
export const getAccessTokenByDevice = (device: IToken["payload"]["device"], authType: string): string => {
	const expiresAt: number = Date.now() + 1000 * 60 * 60 * 2 // 2 hours
	return jwt.sign(
		{
			payload: {
				device: {
					id: device.id,
					mac: device.mac,
					secret: device.secret,
				},
				authType,
				purpose: 'ACCESS',
			},
			exp: Math.floor(expiresAt / 1000),
		},
		process.env.JWT_SECRET,
	)
}


export const tokenIsValid = (token: string): boolean => {
	try {
		const decryptedToken = jwt.verify(token, process.env.JWT_SECRET)
		if (!decryptedToken) return false
		return true
	} catch (err) {
		return false
	}
}

export const getTokenPayload = (token: string) : IToken['payload'] | null => {
	try {
		const decryptedToken = jwt.verify(token, process.env.JWT_SECRET) as IToken
		const tokenPayload = decryptedToken.payload
		return tokenPayload
	} catch (err) {
		// Token did invalidate
		return null
	}
}

export const getTokenExpiration = (token: string) : number => {
	const decodedToken = jwt.decode(token) as IToken
	return decodedToken.exp * 1000
}

export const getAuthTypeByToken = (token: string) : string => {
	try {
		const decryptedToken = jwt.verify(token, process.env.JWT_SECRET) as IToken
		const tokenPayload = decryptedToken.payload

		return tokenPayload.authType
	} catch (err) {
		// Token did invalidate
		return null
	}
}
