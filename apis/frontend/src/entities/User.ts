import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'
import { prop as Property, getModelForClass } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
    ROOT = 'ROOT'
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
    @Property()
    email: string

    @Property({ required: true })
    password: string

    @Field(() => [UserRole])
    @Property({
        required: true,
        default: [UserRole.USER],
        enum: UserRole,
        type: String
    })
    roles: UserRole[]

    @Field()
    @Property()
    firstName: string

    @Field()
    @Property()
    lastName: string

}

export const UserModel = getModelForClass(User)