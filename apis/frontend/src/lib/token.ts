import jwt from 'jsonwebtoken'

import { User } from '../entities/User'
import { Device } from '../entities/Device'

export enum AuthType {
	pin = 'pin',
	password = 'password'
}

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
		authType: AuthType
		purpose: 'REFRESH' | 'ACCESS'
	}
	exp: number
}

export const getRefreshTokenByUser = (user: User, authType: AuthType): string => {
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
		process.env.JWT_SECRET!,
	)
}

export const getAccessTokenByUser = (user: User, authType: AuthType): string => {
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
		process.env.JWT_SECRET!,
	)
}

export const getRefreshTokenByDevice = (device: Device, authType: AuthType): string => {
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
		process.env.JWT_SECRET!,
	)
}

export const getAccessTokenByDevice = (device: Device, authType: AuthType): string => {
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
		process.env.JWT_SECRET!,
	)
}


export const tokenIsValid = (token: string): boolean => {
	try {
		const decryptedToken = jwt.verify(token, process.env.JWT_SECRET!)
		if (!decryptedToken) return false
		return true
	} catch (err) {
		return false
	}
}

export const getTokenPayload = (token: string) : IToken['payload'] | null => {
	try {
		const decryptedToken = jwt.verify(token, process.env.JWT_SECRET!) as IToken
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

export const getAuthTypeByToken = (token: string) : string | undefined => {
	try {
		const decryptedToken = jwt.verify(token, process.env.JWT_SECRET!) as IToken
		const tokenPayload = decryptedToken.payload

		return tokenPayload.authType
	} catch (err) {
		// Token did invalidate
		return undefined
	}
}
