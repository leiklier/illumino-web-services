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

const mutationResolvers = {}

mutationResolvers.setBrightnessOnLedStrip = async (
	obj,
	{ mac, ledStripId, brightness },
	context,
) => {
	const { deviceByMacLoader } = context
	const device = await deviceByMacLoader.load(mac)

	if (!mac) {
		throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
	}

	const ledStrip = device.ledStrips.find(ledStrip => ledStrip.id === ledStripId)

	if (!ledStrip) {
		throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
	}

	ledStrip.brightness = brightness
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

	if (!mac) {
		throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
	}

	const ledStrip = device.ledStrips.find(ledStrip => ledStrip.id === ledStripId)

	if (!ledStrip) {
		throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
	}

	ledStrip.color = color
	await device.save()

	return ledStrip
}

module.exports = {
	typeDefs,
	mutationResolvers,
}
