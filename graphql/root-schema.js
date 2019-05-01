const { gql } = require('apollo-server')

const context = require('./context')
const { userTypeDefs, userResolvers } = require('./schema/user')
const { deviceTypeDefs, deviceResolvers } = require('./schema/device')

const rootTypeDefs = gql`

    type RootQuery {
        login(email: String!, password: String!): AuthData!
    }

    type RootMutation {
        createUser(userInput: UserInput): User!

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
            login: userResolvers.login
        },
        RootMutation: {
            createUser: userResolvers.createUser,

            createDevice: deviceResolvers.createDevice,
            activateDevice: deviceResolvers.activateDevice
        }
    },
    context
}

module.exports = rootSchema