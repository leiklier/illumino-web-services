import { GraphQLScalarType } from 'graphql'
import { GraphQLError } from 'graphql/error'
import { Kind } from 'graphql/language'
import { gql } from 'apollo-server-express'
import { DateTime, EmailAddress } from '@okgrow/graphql-scalars'

export const scalarDefs = gql`
	scalar DateTime

	scalar EmailAddress

	scalar PIN
`


export const scalarResolvers = {
	DateTime,
	EmailAddress,
	PIN:  new GraphQLScalarType({
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
					`Can only parse strings & integers to PIN but got a: ${ast.kind}`,
				)
			}
	
			const result = ast.kind === Kind.INT ? ast.value : parseInt(ast.value)
	
			if (result.toString().length !== 6) {
				throw new TypeError('Invalid number of digits, expected: 6')
			}
	
			return result
		},
	})
}
