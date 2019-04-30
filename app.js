const express = require('express')
const bodyParser = require('body-parser')
const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')

const graphqlSchema = require('./graphql/schema')

const app = express()

app.use(bodyParser.json())

// CORS policy
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200)
	}
	next()
})

app.use(bodyParser.json())

const server = new ApolloServer(graphqlSchema)

server.applyMiddleware({ app })

mongoose
	.connect('mongodb://localhost:27017/ambientalarm', { useNewUrlParser: true })
	.then(() => {
		app.listen({ port: 4000 }, () =>
			console.log(
				`🚀 Server ready at http://localhost:4000${server.graphqlPath}`
			)
		)
	})
