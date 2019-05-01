const { gql } = require('apollo-server')

const context = require('./context')
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
        activateDevice(deviceId: String!): Device!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`

const rootSchema = {
    typeDefs: [userTypeDefs, deviceTypeDefs, rootTypeDefs],
    resolvers: {
        RootQuery: {
            me: userResolvers.me,
            login: userResolvers.login,
            reAuth: userResolvers.reAuth,
            isAuth: userResolvers.isAuth
        },
        RootMutation: {
            createUser: userResolvers.createUser,
            grantAdmin: userResolvers.grantAdmin,

            createDevice: deviceResolvers.createDevice,
            activateDevice: deviceResolvers.activateDevice
        }
    },
    context
}

module.exports = rootSchema