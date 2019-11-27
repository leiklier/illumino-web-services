const { gql } = require('apollo-server-express')

const { context, onConnect } = require('./context')

const { scalarDefs, scalarResolvers } = require('./scalars')

const authSchema = require('./schema/auth')
const userSchema = require('./schema/user')
const deviceSchema = require('./schema/device')
const firmwareSchema = require('./schema/firmware')
const measurementSchema = require('./schema/measurement')
const ledStripSchema = require('./schema/led-strip')

const rootTypeDefs = gql`
	type RootSubsription {
		user(email: String!): User!
		device(mac: String!): Device!
		newMeasurements(mac: String!): Measurement!
		newFirmwares(mac: String): Firmware!
	}

	type RootQuery {
		user(email: String): User
		device(mac: String, secret: String): Device
		devices(secrets: [String!]!): [Device!]!
		secretIsValid(secret: String!): Boolean!
		ledStrip(mac: String!, ledStripId: String!): LedStrip!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])
		ledStrips(mac: String!): [LedStrip!]!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])
		loginUser(email: String!, password: String!): UserAuthData!
		loginDevice(secret: String!, pin: PIN): DeviceAuthData!
		authDevice(mac: String!, authKey: String!): DeviceAuthData!
		accessToken: AuthData!
		isAuth: Boolean!
	}

	type RootMutation {
		setBrightnessOnLedStrip(
			mac: String!
			ledStripId: ID!
			brightness: Float!
		): LedStrip! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		setColorOnLedStrip(
			mac: String!
			ledStripId: ID!
			color: ColorInput!
		): LedStrip! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		setAnimationTypeOnLedStrip(
			mac: String!
			ledStripId: ID!
			animationType: AnimationType!
		): LedStrip! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		setAnimationSpeedOnLedStrip(
			mac: String!
			ledStripId: ID!
			animationSpeed: Float!
		): LedStrip! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		claimDevice(mac: String!): Device! @requiresAuth(acceptsOnly: USER)

		setDevicePin(mac: String!, pin: PIN!): Device!
			@requiresAuth(acceptsOnly: [SELF, OWNER, ADMIN])

		setDeviceName(mac: String!, name: String!): Device!
			@requiresAuth(acceptsOnly: [SELF, OWNER, ADMIN])

		grantAdmin(email: String!): User! @requiresAuth(acceptsOnly: ROOT)

		txBeacon: String! @requiresAuth(acceptsOnly: DEVICE)

		txMeasurement(
			type: MeasurementType!
			environment: MeasurementEnvironment
			value: Float!
		): Measurement! @requiresAuth(acceptsOnly: DEVICE)

		publishFirmware(firmwareInput: FirmwareInput!): Boolean!

		createDevice(deviceInput: DeviceInput!): Device!
			@requiresAuth(acceptsOnly: [DEPLOYER, ADMIN])

		createUser(userInput: UserInput): User!
	}

	schema {
		subscription: RootSubsription
		query: RootQuery
		mutation: RootMutation
	}
`

const rootSchema = {
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
		RootSubsription: {
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

module.exports = rootSchema
