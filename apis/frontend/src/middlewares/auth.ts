import { MiddlewareFn } from 'type-graphql'
import { Context } from '../context'
import { ObjectId } from 'mongodb'
import * as error from '../errors'
import { ApolloError } from 'apollo-server-express'
import { keepOnlyAlphaNumeric } from '../lib/string'

interface IdArgs {
	email?: string
	secret?: string
}

export enum Role {
	USER = 'USER',
	DEVICE = 'DEVICE',
	ADMIN = 'ADMIN',
	ROOT = 'ROOT',
	DEPLOYER = 'DEPLOYER',
}

export enum Relation {
	SELF = 'SELF',
	OWNER = 'OWNER',
	MANAGER = 'MANAGER',
}

interface AuthArgs {
	accepts?: Array<Role | Relation>
}

export function Auth({ accepts }: AuthArgs): MiddlewareFn<Context> {
	return async ({ root, context, args, info }, next) => {
		if (!context.isAuth) throw new ApolloError(error.NOT_AUTHENTICATED)

		if (!accepts || !accepts.length) return next()

		const { secret } = args as IdArgs
		const id: ObjectId | undefined = root == Object(root) && root.id

		// Strip for [], ! - we are only interested in the type,
		// i.e. `User` and not `[User!]!`:
		const parentType = keepOnlyAlphaNumeric(info.parentType.toString())

		if (secret && context.device?.secret === secret) {
			// We are resolving something that takes
			// secret as input, and authenticated as this `Device`
			if (accepts?.includes(Relation.SELF)) return next()
		}

		if (id && parentType === 'Device' && id === context.device?.id) {
			// We are resolving the fields of a `Device`,
			// and we are authenticated as this `Device`
			if (accepts?.includes(Relation.SELF)) return next()
		}

		throw new ApolloError(error.NOT_AUTHORIZED)
	}
}
