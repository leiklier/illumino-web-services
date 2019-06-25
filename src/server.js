require('dotenv').config()
const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')

const graphqlSchema = require('./graphql/root-schema')

const server = new ApolloServer(graphqlSchema)

// NB: The application is utilizing change streams,
// and thus requires the mongod instance to be a
// replica set. For info on how to configure it
// locally, read here:
// https://gist.github.com/davisford/bb37079900888c44d2bbcb2c52a5d6e8

mongoose
	.connect(
		`mongodb://localhost:27017/${process.env.MONGO_DB}?replicaSet=replocal`,
		{
			useNewUrlParser: true,
		},
	)
	.then(() => {
		server.listen(process.env.PORT || 4000).then(({ url }) => {
			console.log(`🚀 Server ready at ${url}`)
		})
	})
