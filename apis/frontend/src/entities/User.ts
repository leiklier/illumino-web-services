import { ObjectType, Field, ID, registerEnumType, ArgsType } from 'type-graphql'
import { prop as Property, getModelForClass } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { IsEmail } from 'class-validator'

@ArgsType()
export class UserArgs {
	@Field()
	@IsEmail()
	email: string
}

export enum UserRole {
	USER = 'USER',
	ADMIN = 'ADMIN',
	ROOT = 'ROOT',
}

registerEnumType(UserRole, {
	name: 'UserRole',
	description: 'UserRole describes which permissions a User has in the API',
})

@ObjectType({ description: 'People who have signed up with their email' })
export class User {
	@Field(() => ID)
	readonly id: ObjectId

	@Field()
	@Property({ unique: true })
	email!: string

	@Property()
	password!: string

	@Field(() => [UserRole])
	@Property({
		default: [UserRole.USER],
		enum: UserRole,
		type: String,
	})
	roles!: UserRole[]

	@Field()
	@Property()
	firstName: string

	@Field()
	@Property()
	lastName: string
}

export const UserModel = getModelForClass(User)
