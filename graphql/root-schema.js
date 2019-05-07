const { gql } = require('apollo-server')

const context = require('./context')

const { authTypeDefs, authResolvers, RequiresAuthDirective } = require('./schema/auth')
const { userTypeDefs, userResolvers } = require('./schema/user')
const { deviceTypeDefs, deviceResolvers } = require('./schema/device')

const rootTypeDefs = gql`

    type RootQuery {
        me: User! @requiresAuth(rolesAccepted: [USER])
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
    typeDefs: [authTypeDefs, userTypeDefs, deviceTypeDefs, rootTypeDefs],
    resolvers: {
        AuthData: {
            __resolveType(authData, context, info) {
                if(authData.userId) {
                    return 'UserAuthData'
                }

                if(authData.deviceId) {
                    return 'DeviceAuthData'
                }

                return null
            }
        },
        RootQuery: {
            loginUser: authResolvers.loginUser,
            loginDevice: authResolvers.loginDevice,
            refreshToken: authResolvers.refreshToken,
            isAuth: authResolvers.isAuth,

            me: userResolvers.me
        },
        RootMutation: {
            createUser: userResolvers.createUser,
            grantAdmin: userResolvers.grantAdmin,

            createDevice: deviceResolvers.createDevice,
            claimDevice: deviceResolvers.claimDevice,
            setDeviceName: deviceResolvers.setDeviceName,
            setDevicePin: deviceResolvers.setDevicePin,
            txBeacon: deviceResolvers.txBeacon
        }
    },
    context,
    schemaDirectives: {
        requiresAuth: RequiresAuthDirective
    }
}

module.exports = rootSchema