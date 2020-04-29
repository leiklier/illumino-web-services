require('dotenv').config()
const path = require('path')
global.appRoot = path
	.resolve(__dirname)
	.substring(0, path.resolve(__dirname).lastIndexOf('/'))

const http = require('http')
const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')

const { NODE_ENV, PORT, MONGO_DB } = process.env

const logger = require('./logger')
const enableRestEndpoints = require('./rest')
const graphqlSchema = require('./graphql/root-schema')

const app = express()
app.use(cookieParser())
app.use(bodyParser.json())
enableRestEndpoints(app)

const server = new ApolloServer(graphqlSchema)
server.applyMiddleware({
	app,
	cors: {
		origin: 'http://get-illumi.no',
		credentials: true,
	},
})

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

// Since this application may be dockerized, we want to
// watch for changes in package.json, and install new
// packages if file changes:
if (NODE_ENV === 'development') {
	const { exec } = require('child_process')
	function installPackages() {
		exec('yarn install', (err, stdout, stderr) => {
			if (err) {
				// node couldn't execute the command
				return
			}

			//console.log(stdout)
		})
	}

	// Install new packages on spawn:
	// ( since nodemon restarts server on
	// package.json change, this is
	// sufficient )
	installPackages()
}

// NB: The application is utilizing change streams,
// and thus requires the mongod instance to be a
// replica set. For info on how to configure it
// locally, read here:
// https://gist.github.com/davisford/bb37079900888c44d2bbcb2c52a5d6e8

mongoose
	.connect(
		`mongodb+srv://dbUser:OdlHOQDukkJkjNy8@illumino-p68vt.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
		},
	)
	.then(() => {

		httpServer.listen(PORT || 3000, () => {
			logger.info(
				`Server started with endpoints http://localhost:${PORT}${
				server.graphqlPath
				}, ws://localhost:${PORT}${server.subscriptionsPath}`,
				{ target: 'SERVER', event: 'STARTED' },
			)
		})
	})
