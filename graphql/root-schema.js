const { gql } = require('apollo-server')

const context = require('./context')

const { authTypeDefs, authResolvers } = require('./schema/auth')
const { userTypeDefs, userResolvers } = require('./schema/user')
const { deviceTypeDefs, deviceResolvers } = require('./schema/device')

const rootTypeDefs = gql`

    type RootQuery {
        me: User!
        login(email: String!, password: String!): AuthData!
        reAuth: AuthData!
        isAuth: Boolean!
    }

    type RootMutation {
        createUser(userInput: UserInput): User!
        grantAdmin(email: String!): User!

        createDevice(ownerEmail: String): Device!
        claimDevice(deviceId: String!): Device!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`

const rootSchema = {
    typeDefs: [authTypeDefs, userTypeDefs, deviceTypeDefs, rootTypeDefs],
    resolvers: {
        RootQuery: {
            login: authResolvers.login,
            reAuth: authResolvers.reAuth,
            isAuth: authResolvers.isAuth,

            me: userResolvers.me
        },
        RootMutation: {
            createUser: userResolvers.createUser,
            grantAdmin: userResolvers.grantAdmin,

            createDevice: deviceResolvers.createDevice,
            claimDevice: deviceResolvers.claimDevice
        }
    },
    context
}

module.exports = rootSchema