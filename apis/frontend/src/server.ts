declare var global: any;

import dotenv from 'dotenv'
dotenv.config()

import path from 'path'
global.appRoot = path
	.resolve(__dirname)
	.substring(0, path.resolve(__dirname).lastIndexOf('/'))

import http from 'http'
import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import { ApolloServer } from 'apollo-server-express'
import mongoose from 'mongoose'

const { PORT } = process.env

import logger from './logger'
import graphqlSchema from './graphql/root-schema'

const app = express()
app.use(cookieParser())
app.use(bodyParser.json())

const server: ApolloServer = new ApolloServer({
	...graphqlSchema,
	introspection: true,
})
server.applyMiddleware({
	app,
	cors: {
		origin: getCorsOriginsFromEnv(),
		credentials: true,
	},
})

const httpServer: http.Server = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

// NB: The application is utilizing change streams,
// and thus requires the mongod instance to be a
// replica set. For info on how to configure it
// locally, read here:
// https://gist.github.com/davisford/bb37079900888c44d2bbcb2c52a5d6e8

mongoose
	.connect(
		`mongodb+srv://dbUser:7w8u4hivR8QPB4bQ@illumino-p68vt.mongodb.net/illumino?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			// Each `changeStream` requires a new connection,
			// so we need a really large `poolSize` to cover this demand.
			// Read more here:
			// https://stackoverflow.com/questions/48411897/severe-performance-drop-with-mongodb-change-streams
			poolSize: 1000,
		},
	)
	.then(() => {
		httpServer.listen(PORT, () => {
			logger.info(
				`Server started with endpoints http://api.get-illumi.no:${PORT}${
				server.graphqlPath
				}, wss://localhost:${PORT}${server.subscriptionsPath}`,
				{ target: 'SERVER', event: 'STARTED' },
			)
		})
	})

function getCorsOriginsFromEnv() {
	const { ACCESS_CONTROL_ALLOW_ORIGIN: corsString } = process.env
	if (!corsString) return false

	const corsOrigins = String(corsString).split(';')
	return corsOrigins
}