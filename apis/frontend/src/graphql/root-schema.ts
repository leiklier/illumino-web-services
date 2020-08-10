import { gql, ApolloServerExpressConfig } from 'apollo-server-express'

import { context, onConnect } from './context'

import { scalarDefs, scalarResolvers } from './scalars'

import * as authSchema from './schema/auth'
import * as userSchema from './schema/user'
import * as deviceSchema from './schema/device'
import * as firmwareSchema from './schema/firmware'
import * as measurementSchema from './schema/measurement'
import * as ledStripSchema from './schema/led-strip'

const rootTypeDefs = gql`
	type RootSubscription {
		device(secret: String!): Device!
	}

	type RootQuery {
		user(email: String): User
		device(secret: String!): Device
		devices(secrets: [String!]!): [Device!]!
		secretIsValid(secret: String!): Boolean!
		ledStrip(secret: String!, ledStripId: String!): LedStrip!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])
		ledStrips(secret: String!): [LedStrip!]!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])
		logout: Boolean!
		loginUser(email: String!, password: String!): UserAuthData!
		loginDevice(secret: String!, pin: PIN): DeviceAuthData!
		accessToken: AuthData!
		isAuth: Boolean!
		hasRefreshToken: Boolean!
	}

	type RootMutation {
		setGeometryOnLedStrip(
			secret: String!
			ledStripIndex: Int!
			geometry: GeometryInput!
		): LedStrip! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		setBrightnessOnLedStrip(
			secret: String!
			ledStripIndex: Int!
			brightness: Float!
		): LedStrip! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		setColorOnLedStrip(
			secret: String!
			ledStripIndex: Int!
			color: ColorInput!
		): LedStrip! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		setAnimationTypeOnLedStrip(
			secret: String!
			ledStripIndex: Int!
			animationType: AnimationType!
		): LedStrip! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		setAnimationSpeedOnLedStrip(
			secret: String!
			ledStripIndex: Int!
			animationSpeed: Float!
		): LedStrip! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		setLedStripsAreSynced(secret: String!, masterLedStripId: ID!): Device!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		clearLedStripsAreSynced(secret: String!): Device!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		startSunset(secret: String!, startedAt: DateTime!, endingAt: DateTime!): Device!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		stopSunset(secret: String!): Device!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		updateSunrise(secret: String!, startingAt: TimeInput!, isActive: Boolean!): Device!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])


		claimDevice(secret: String!): Device! @requiresAuth(acceptsOnly: USER)

		setDevicePin(secret: String!, pin: PIN!): Device!
			@requiresAuth(acceptsOnly: [SELF, OWNER, ADMIN])

		setDeviceName(secret: String!, name: String!): Device!
			@requiresAuth(acceptsOnly: [SELF, OWNER, ADMIN])
		
		setDeviceEnvironment(secret: String!, environment: DeviceEnvironment!): Device!
			@requiresAuth(acceptsOnly: [SELF, OWNER, ADMIN])

		grantAdmin(email: String!): User! @requiresAuth(acceptsOnly: ROOT)


		publishFirmware(firmwareInput: FirmwareInput!): Boolean!

		createUser(userInput: UserInput): User!
	}

	schema {
		subscription: RootSubscription
		query: RootQuery
		mutation: RootMutation
	}
`

const rootSchema: ApolloServerExpressConfig = {
	typeDefs: [
		scalarDefs,
		authSchema.typeDefs,
		userSchema.typeDefs,
		deviceSchema.typeDefs,
		firmwareSchema.typeDefs,
		measurementSchema.typeDefs,
		ledStripSchema.typeDefs,
		rootTypeDefs,
	],
	resolvers: {
		...scalarResolvers,
		RootSubscription: {
			...userSchema.subscriptionResolvers,
			...deviceSchema.subscriptionResolvers,
			...firmwareSchema.subscriptionResolvers,
			...measurementSchema.subscriptionResolvers,
		},
		RootQuery: {
			...authSchema.queryResolvers,
			...userSchema.queryResolvers,
			...deviceSchema.queryResolvers,
			...ledStripSchema.queryResolvers,
			...measurementSchema.queryResolvers,
		},
		RootMutation: {
			...authSchema.mutationResolvers,
			...userSchema.mutationResolvers,
			...deviceSchema.mutationResolvers,
			...firmwareSchema.mutationResolvers,
			...measurementSchema.mutationResolvers,
			...ledStripSchema.mutationResolvers,
		},
		AuthData: authSchema.AuthDataResolver,
		User: userSchema.UserResolver,
		Device: deviceSchema.DeviceResolver,
		Firmware: firmwareSchema.FirmwareResolver,
		Measurement: measurementSchema.MeasurementResolver,
	},
	context,
	subscriptions: { onConnect },
	schemaDirectives: {
		requiresAuth: authSchema.RequiresAuthDirective,
	},
}

export default rootSchema
