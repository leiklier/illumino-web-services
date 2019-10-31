const { gql } = require('apollo-server-express')

const typeDefs = gql`
	type Color {
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
		name: String!
		intensity: Float!
		color: Color!
		animation: Animation!
	}
`

module.exports = {
	typeDefs,
}
