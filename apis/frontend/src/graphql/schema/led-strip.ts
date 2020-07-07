import { gql, ApolloError } from 'apollo-server-express'
import { IContext } from '../context'

import * as error from '../errors'

export const typeDefs = gql`
	type Color {
		hue: Float!
		saturation: Float!
	}

	input ColorInput {
		hue: Float!
		saturation: Float!
	}

	enum AnimationType {
		MANUAL
		VIVID
		GLOW
		SPARKS
		FIREPLACE
	}

	type Animation {
		type: AnimationType!
		speed: Float!
	}

	type LedStrip {
		id: ID!
		name: String!
		brightness: Float!
		color: Color!
		animation: Animation!
	}
`

export const queryResolvers = {
	ledStrip: async (obj, { secret, ledStripId }, context: IContext) => {
		const { deviceBySecretLoader } = context
		const device = await deviceBySecretLoader.load(secret)
	
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		const ledStrip = device.ledStrips.find(ledStrip => ledStrip.id === ledStripId)
	
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}
	
		return ledStrip
	},

	ledStrips: async (obj, { secret }, context: IContext) => {
		const { deviceBySecretLoader } = context
		const device = await deviceBySecretLoader.load(secret)
	
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		const { ledStrips } = device
	
		if (!ledStrips) {
			throw new ApolloError(error.LED_STRIPS_DO_NOT_EXIST)
		}
	
		return ledStrips
	},
}

export const mutationResolvers = {
	setBrightnessOnLedStrip: async (
		obj,
		{ secret, ledStripIndex, brightness },
		context: IContext,
	) => {
		const { deviceBySecretLoader } = context
	
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}
	
		if (device.ledStripsAreSynced) {
			device.ledStrips = device.toObject().ledStrips.map(ledStrip => {
				return {
					...ledStrip,
					brightness,
				}
			})
		} else {
			ledStrip.brightness = brightness
		}
	
		await device.save()
		return ledStrip
	},

	setColorOnLedStrip: async (
		obj,
		{ secret, ledStripIndex, color },
		context: IContext,
	) => {
		const { deviceBySecretLoader } = context
	
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}
	
		if (device.ledStripsAreSynced) {
			device.ledStrips = device.toObject().ledStrips.map(ledStrip => {
				return {
					...ledStrip,
					color,
				}
			})
		} else {
			ledStrip.color = color
		}
	
		await device.save()
		return ledStrip
	},

	setAnimationTypeOnLedStrip: async (
		obj,
		{ secret, ledStripIndex, animationType },
		context: IContext,
	) => {
		const { deviceBySecretLoader } = context
	
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}
	
		if (device.ledStripsAreSynced) {
			device.ledStrips = device.toObject().ledStrips.map(ledStrip => {
				return {
					...ledStrip,
					animation: {
						...ledStrip.animation,
						type: animationType,
					},
				}
			})
		} else {
			ledStrip.animation.type = animationType
		}
	
		await device.save()
		return ledStrip
	},

	setAnimationSpeedOnLedStrip: async (
		obj,
		{ secret, ledStripIndex, animationSpeed },
		context: IContext,
	) => {
		const { deviceBySecretLoader } = context
	
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}
	
		if (device.ledStripsAreSynced) {
			device.ledStrips = device.toObject().ledStrips.map(ledStrip => {
				return {
					...ledStrip,
					animation: {
						...ledStrip.animation,
						speed: animationSpeed,
					},
				}
			})
		} else {
			ledStrip.animation.speed = animationSpeed
		}
	
		await device.save()
		return ledStrip
	},

	setLedStripsAreSynced: async (
		obj,
		{ secret, masterLedStripId },
		context: IContext,
	) => {
		const { deviceBySecretLoader } = context
	
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		const { brightness, color, animation } = device.ledStrips.find(
			ledStrip => ledStrip.id === masterLedStripId,
		)
	
		device.ledStrips = device.toObject().ledStrips.map(ledStrip => {
			return {
				...ledStrip,
				brightness,
				color,
				animation,
			}
		})
	
		device.ledStripsAreSynced = true
		await device.save()
	
		return device
	},

	clearLedStripsAreSynced: async (obj, { secret }, context: IContext) => {
		const { deviceBySecretLoader } = context
	
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		device.ledStripsAreSynced = false
		await device.save()
	
		return device
	}
}
