require('dotenv').config()
const http = require('http')
const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')

const { PORT, MONGO_DB } = process.env

const enableRestEndpoints = require('./rest')
const graphqlSchema = require('./graphql/root-schema')

const app = express()
enableRestEndpoints(app)

const server = new ApolloServer(graphqlSchema)
server.applyMiddleware({ app })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

// NB: The application is utilizing change streams,
// and thus requires the mongod instance to be a
// replica set. For info on how to configure it
// locally, read here:
// https://gist.github.com/davisford/bb37079900888c44d2bbcb2c52a5d6e8

mongoose
	.connect(`mongodb://localhost:27017/${MONGO_DB}?replicaSet=replocal`, {
		useNewUrlParser: true,
	})
	.then(() => {
		httpServer.listen(PORT, () => {
			console.log(
				`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`,
			)
			console.log(
				`🚀 Subscriptions ready at ws://localhost:${PORT}${
					server.subscriptionsPath
				}`,
			)
		})
	})
