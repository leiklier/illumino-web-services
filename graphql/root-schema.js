const { gql } = require('apollo-server')

const context = require('./context')

const { authTypeDefs, authResolvers } = require('./schema/auth')
const { userTypeDefs, userResolvers } = require('./schema/user')
const { deviceTypeDefs, deviceResolvers } = require('./schema/device')

const rootTypeDefs = gql`

    type RootQuery {
        """ Requires context.user.isAuth """
        me: User!
        loginUser(email: String!, password: String!): UserAuthData!

        """ Requires context.device.isAuth """
        loginDevice(mac: String!, pin: Int!): DeviceAuthData!

        """ Requires context.user.isAuth || context.device.isAuth """
        refreshToken: AuthData!

        """ Accessible for everyone """
        isAuth: Boolean!
    }

    type RootMutation {
        """ Requires context.user.isAuth """
        claimDevice(mac: String!): Device!

        """ Requires context.user.isAuth && device.owner """
        setDevicePin(mac: String!, pin: Int!): Device!
        setDeviceName(mac: String!, name: String!): Device!

        """ Requires context.user.isAdmin """
        grantAdmin(email: String!): User!

        """ Requires context.device.isAuth """
        txBeacon: String!

        """ Accessible for everyone """
        createUser(userInput: UserInput): User!
        createDevice(deviceInput: DeviceInput!): Device!
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
    context
}

module.exports = rootSchema