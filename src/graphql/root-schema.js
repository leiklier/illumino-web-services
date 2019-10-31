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
		newMeasurements(mac: String!): Measurement!
		newFirmwares(mac: String): Firmware!
	}

	type RootQuery {
		user(email: String): User
		device(mac: String): Device
		loginUser(email: String!, password: String!): UserAuthData!
		loginDevice(mac: String!, secret: String!, pin: PIN): DeviceAuthData!
		authDevice(mac: String!, authKey: String!): DeviceAuthData!
		refreshToken: AuthData! @requiresAuth(acceptsOnly: [USER, DEVICE])
		isAuth: Boolean!
	}

	type RootMutation {
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
			...firmwareSchema.subscriptionResolvers,
			...measurementSchema.subscriptionResolvers,
		},
		RootQuery: {
			...authSchema.queryResolvers,
			...userSchema.queryResolvers,
			...deviceSchema.queryResolvers,
			...measurementSchema.queryResolvers,
		},
		RootMutation: {
			...authSchema.mutationResolvers,
			...userSchema.mutationResolvers,
			...deviceSchema.mutationResolvers,
			...firmwareSchema.mutationResolvers,
			...measurementSchema.mutationResolvers,
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
