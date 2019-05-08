const { gql } = require('apollo-server')

const context = require('./context')

const authSchema = require('./schema/auth')
const userSchema = require('./schema/user')
const deviceSchema = require('./schema/device')

const rootTypeDefs = gql`

    type RootQuery {
        user(email: String): User @requiresAuth(rolesAccepted: [USER, DEVICE])
        device(mac: String): Device @requiresAuth(rolesAccepted: [USER, DEVICE])
        loginUser(email: String!, password: String!): UserAuthData!
        loginDevice(mac: String!, pin: Int!): DeviceAuthData!
        refreshToken: AuthData! @requiresAuth(rolesAccepted: [USER, DEVICE])
        isAuth: Boolean!
    }

    type RootMutation {
        claimDevice(mac: String!): Device! @requiresAuth(rolesAccepted: [USER])

        setDevicePin(mac: String!, pin: Int!): Device! @requiresAuth(rolesAccepted: [DEVICE_OWNER, ADMIN])
        setDeviceName(mac: String!, name: String!): Device! @requiresAuth(rolesAccepted: [DEVICE_OWNER, ADMIN])

        grantAdmin(email: String!): User! @requiresAuth(rolesAccepted: [ROOT])

        txBeacon: String! @requiresAuth(rolesAccepted: [DEVICE])

        createDevice(deviceInput: DeviceInput!): Device! @requiresAuth(rolesAccepted: [DEPLOYER, ADMIN])

        createUser(userInput: UserInput): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`

const rootSchema = {
    typeDefs: [authSchema.typeDefs, userSchema.typeDefs, deviceSchema.typeDefs, rootTypeDefs],
    resolvers: {
        RootQuery: {
            ...authSchema.queryResolvers,
            ...userSchema.queryResolvers,
            ...deviceSchema.queryResolvers,
        },
        RootMutation: {
            ...authSchema.mutationResolvers,
            ...userSchema.mutationResolvers,
            ...deviceSchema.mutationResolvers,
        },
        AuthData: authSchema.AuthDataResolver,
        User: userSchema.UserResolver,
        Device: deviceSchema.DeviceResolver,
    },
    context,
    schemaDirectives: {
        requiresAuth: authSchema.RequiresAuthDirective
    }
}

module.exports = rootSchema