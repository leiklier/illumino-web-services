import { createMethodDecorator } from 'type-graphql'
import * as error from '../errors'
import { ApolloError } from 'apollo-server-express'
import { UserArgs, UserModel } from '../entities/User'

export function AssertUserExists(): MethodDecorator {
	return createMethodDecorator(async ({ args }, next) => {
		const { email } = args as UserArgs

		const user = await UserModel.findOne({ email })
		if (!user) {
			throw new ApolloError(error.USER_DOES_NOT_EXIST)
		}

		return next()
	})
}
