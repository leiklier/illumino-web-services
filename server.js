const express = require('express')
const bodyParser = require('body-parser')
const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')

const graphqlSchema = require('./graphql/root-schema')


const server = new ApolloServer(graphqlSchema)

mongoose
	.connect(`mongodb://localhost:27017/${process.env.MONGO_DB}`, { useNewUrlParser: true })
	.then(() => {
		server.listen(process.env.PORT).then(({ url }) => {
			console.log(`🚀 Server ready at ${url}`);
		  })
	})