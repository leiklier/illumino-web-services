const { gql } = require('apollo-server')
const { DateTime, EmailAddress } = require('@okgrow/graphql-scalars')

const scalarDefs = gql`
	scalar DateTime

	scalar EmailAddress
`

const scalarResolvers = {
	DateTime,
	EmailAddress,
}

module.exports = {
	scalarDefs,
	scalarResolvers,
}
