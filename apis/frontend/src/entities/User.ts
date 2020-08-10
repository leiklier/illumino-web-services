import { ObjectType, Field, ID } from 'type-graphql'
import { prop as Property, getModelForClass } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

@ObjectType({ description: 'People who have signed up with their email' })
export class User {
    @Field(() => ID)
    readonly id: ObjectId

    @Field()
    @Property()
    email: string

    @Field()
    @Property()
    firstName: string

    @Field()
    @Property()
    lastName: string
}

export const UserModel = getModelForClass(User)