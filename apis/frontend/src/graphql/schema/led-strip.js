const { gql, ApolloError } = require('apollo-server-express')

const error = require('../errors')

const typeDefs = gql`
	type Color {
		red: Int!
		green: Int!
		blue: Int!
	}

	input ColorInput {
		red: Int!
		green: Int!
		blue: Int!
	}

	enum AnimationType {
		MANUAL
		LAVA
		RAINBOW
		SUNRISE
		SUNSET
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

const queryResolvers = {}
const mutationResolvers = {}

queryResolvers.ledStrip = async (obj, { mac, ledStripId }, context) => {
	const { deviceByMacLoader } = context
	const device = await deviceByMacLoader.load(mac)

	if (!device) {
		throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
	}

	const ledStrip = device.ledStrips.find(ledStrip => ledStrip.id === ledStripId)

	if (!ledStrip) {
		throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
	}

	return ledStrip
}

queryResolvers.ledStrips = async (obj, { mac }, context) => {
	const { deviceByMacLoader } = context
	const device = await deviceByMacLoader.load(mac)

	if (!device) {
		throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
	}

	const { ledStrips } = device

	if (!ledStrips) {
		throw new ApolloError(error.LED_STRIPS_DO_NOT_EXIST)
	}

	return ledStrips
}

mutationResolvers.setBrightnessOnLedStrip = async (
	obj,
	{ mac, ledStripIndex, brightness },
	context,
) => {
	const { deviceByMacLoader } = context

	const device = await deviceByMacLoader.load(mac)
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
}

mutationResolvers.setColorOnLedStrip = async (
	obj,
	{ mac, ledStripId, color },
	context,
) => {
	const { deviceByMacLoader } = context

	const device = await deviceByMacLoader.load(mac)
	if (!device) {
		throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
	}

	const ledStrip = device.ledStrips.find(ledStrip => ledStrip.id === ledStripId)
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
}

mutationResolvers.setAnimationTypeOnLedStrip = async (
	obj,
	{ mac, ledStripIndex, animationType },
	context,
) => {
	const { deviceByMacLoader } = context

	const device = await deviceByMacLoader.load(mac)
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
}

mutationResolvers.setAnimationSpeedOnLedStrip = async (
	obj,
	{ mac, ledStripIndex, animationSpeed },
	context,
) => {
	const { deviceByMacLoader } = context

	const device = await deviceByMacLoader.load(mac)
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
}

mutationResolvers.setLedStripsAreSynced = async (
	obj,
	{ mac, masterLedStripId },
	context,
) => {
	const { deviceByMacLoader } = context

	const device = await deviceByMacLoader.load(mac)
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
}

mutationResolvers.clearLedStripsAreSynced = async (obj, { mac }, context) => {
	const { deviceByMacLoader } = context

	const device = await deviceByMacLoader.load(mac)
	if (!device) {
		throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
	}

	device.ledStripsAreSynced = false
	await device.save()

	return device
}

module.exports = {
	typeDefs,
	queryResolvers,
	mutationResolvers,
}
