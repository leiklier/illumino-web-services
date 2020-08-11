import { ObjectType, Field } from 'type-graphql'
import { prop as Property } from '@typegoose/typegoose'

@ObjectType({ description: 'A LedStrip belonging to a certain Device' })
export class LedStrip {
    @Field()
    @Property({ required: true })
    name: string
}