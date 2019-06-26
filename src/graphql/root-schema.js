const { gql } = require('apollo-server')

const { context, onConnect } = require('./context')

const { scalarDefs, scalarResolvers } = require('./scalars')

const authSchema = require('./schema/auth')
const userSchema = require('./schema/user')
const deviceSchema = require('./schema/device')
const measurementSchema = require('./schema/measurement')

const rootTypeDefs = gql`
	type RootSubsription {
		user(email: String!): User!
		newMeasurements(mac: String!): Measurement!
	}

	type RootQuery {
		user(email: String): User
		device(mac: String): Device
		loginUser(email: String!, password: String!): UserAuthData!
		loginDevice(mac: String!, pin: Int!): DeviceAuthData!
		authDevice(mac: String!, authKey: String!): DeviceAuthData!
		refreshToken: AuthData! @requiresAuth(rolesAccepted: [USER, DEVICE])
		isAuth: Boolean!
	}

	type RootMutation {
		claimDevice(mac: String!): Device! @requiresAuth(rolesAccepted: [USER])

		setDevicePin(mac: String!, pin: Int!): Device!
			@requiresAuth(rolesAccepted: [ADMIN], relationsAccepted: [SELF, OWNER])

		setDeviceName(mac: String!, name: String!): Device!
			@requiresAuth(rolesAccepted: [ADMIN])

		grantAdmin(email: String!): User! @requiresAuth(rolesAccepted: [ROOT])

		txBeacon: String! @requiresAuth(rolesAccepted: [DEVICE])

		txMeasurement(
			type: MeasurementType!
			environment: MeasurementEnvironment
			value: Float!
		): Measurement! @requiresAuth(rolesAccepted: [DEVICE])

		createDevice(deviceInput: DeviceInput!): Device!
			@requiresAuth(rolesAccepted: [DEPLOYER, ADMIN])

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
		measurementSchema.typeDefs,
		rootTypeDefs,
	],
	resolvers: {
		...scalarResolvers,
		RootSubsription: {
			...userSchema.subscriptionResolvers,
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
			...measurementSchema.mutationResolvers,
		},
		AuthData: authSchema.AuthDataResolver,
		User: userSchema.UserResolver,
		Device: deviceSchema.DeviceResolver,
		Measurement: measurementSchema.MeasurementResolver,
	},
	context,
	subscriptions: { onConnect },
	schemaDirectives: {
		requiresAuth: authSchema.RequiresAuthDirective,
	},
}

module.exports = rootSchema
