const { gql } = require('apollo-server')

const context = require('./context')

const { authTypeDefs, authResolvers } = require('./schema/auth')
const { userTypeDefs, userResolvers } = require('./schema/user')
const { deviceTypeDefs, deviceResolvers } = require('./schema/device')

const rootTypeDefs = gql`

    type RootQuery {
        me: User!
        loginUser(email: String!, password: String!): UserAuthData!
        loginDevice(mac: String!, pin: Int!): DeviceAuthData!
        refreshToken: AuthData!
        isAuth: Boolean!
    }

    type RootMutation {
        createUser(userInput: UserInput): User!
        grantAdmin(email: String!): User!

        createDevice(deviceInput: DeviceInput!): Device!
        claimDevice(mac: String!): Device!
        setDevicePin(mac: String!, pin: Int!): Device!
        setDeviceName(mac: String!, name: String!): Device!
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
            setDevicePin: deviceResolvers.setDevicePin
        }
    },
    context
}

module.exports = rootSchema