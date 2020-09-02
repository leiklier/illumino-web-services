import { ObjectType, Field } from 'type-graphql'
import { prop as Property } from '@typegoose/typegoose'

@ObjectType({ description: 'Sunset is used for emulating a sunset on the connected LedStrip(s)' })
export class Sunset {
    @Field({ nullable: true })
    @Property()
    startedAt?: Date

    @Field({ nullable: true })
    @Property()
    endingAt?: Date
}

