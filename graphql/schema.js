const { gql } = require("apollo-server-express")
const lodash = require('lodash')
const { makeExecutableSchema } = require('graphql-tools')

const { userTypeDefs, userResolvers } = require('./user')

const rootTypeDefs = gql`

    type RootQuery {
        login(email: String!, password: String!): AuthData!
    }

    type RootMutation {
        createUser(userInput: UserInput): User
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`

const rootSchema = {
    typeDefs: [userTypeDefs, rootTypeDefs],
    resolvers: {
        RootQuery: {
            login: userResolvers.login
        },
        RootMutation: {
            createUser: userResolvers.createUser
        }
    }
        
}

module.exports = rootSchema