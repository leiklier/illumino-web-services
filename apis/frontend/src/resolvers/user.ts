import { Resolver, Query, Arg, Mutation, InputType, Field } from 'type-graphql'
import { User, UserModel } from '../entities/User'
import { IsEmail, Length } from 'class-validator'
import * as error from '../errors'
import { ApolloError } from 'apollo-server-express'
import bcrypt from 'bcrypt'

@InputType()
class NewUserInput {
	@Field()
	firstName: string

	@Field()
	lastName: string

	@Field()
	@IsEmail()
	email: string

	@Field()
	@Length(8)
	password: string
}

@Resolver()
export default class UserResolver {
	@Query(() => User)
	async user(@Arg('email') email: string): Promise<User> {
		return (await UserModel.findOne({ email }))!
	}

	@Mutation(() => User)
	async createUser(
		@Arg('userInput') { firstName, lastName, email, password }: NewUserInput,
	): Promise<User> {
		const emailIsTaken = !!(await UserModel.findOne({ email }))
		if (emailIsTaken) throw new ApolloError(error.USER_DOES_ALREADY_EXIST)

		const hashedPassword = await bcrypt.hash(password, 12)

		const user = await UserModel.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
		} as User)

		return user
	}
}
