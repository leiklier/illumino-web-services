const { GraphQLScalarType } = require('graphql')
const { GraphQLError } = require('graphql/error')
const { Kind } = require('graphql/language')
const { gql } = require('apollo-server')
const { DateTime, EmailAddress } = require('@okgrow/graphql-scalars')

const scalarDefs = gql`
	scalar DateTime

	scalar EmailAddress

	scalar PIN
`

const scalarResolvers = {
	DateTime,
	EmailAddress,
}

scalarResolvers.PIN = new GraphQLScalarType({
	name: 'PIN',
	description: 'PIN code, 6 digit number',
	serialize(value) {
		if (typeof value === 'string') {
			value = parseInt(value)
		}

		if (typeof value !== 'number') {
			throw new TypeError('Value is not a number')
		}

		if (value.toString().length !== 6) {
			throw new TypeError('Invalid number of digits, expected: 6')
		}

		return value
	},

	parseValue(value) {
		if (typeof value === 'string') {
			value = parseInt(value)
		}

		if (typeof value !== 'number') {
			throw new TypeError('Value is not a number')
		}

		if (value.toString().length !== 6) {
			throw new TypeError('Invalid number of digits, expected: 6')
		}

		return value
	},

	parseLiteral(ast) {
		if (ast.kind !== Kind.STRING && ast.kind !== Kind.INT) {
			throw new GraphQLError(
				`Can only parse strings & integers to dates but got a: ${ast.kind}`,
			)
		}

		const result = ast.kind === Kind.INT ? ast.value : parseInt(ast.value)

		if (result.toString().length !== 6) {
			throw new TypeError('Invalid number of digits, expected: 6')
		}

		return result
	},
})

module.exports = {
	scalarDefs,
	scalarResolvers,
}
