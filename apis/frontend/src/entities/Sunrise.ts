import { ObjectType, Field } from 'type-graphql'
import { prop as Property } from '@typegoose/typegoose'
import { Time } from './Time'

@ObjectType({ description: `
Sunrise is used for emulating a sunrise on the connected LedStrip(s). 
This is useful for getting a nice start of the day.
`})
export class Sunrise {
    @Field()
    @Property()
    isActive!: boolean

    @Field(() => Time)
    @Property({ type: Time })
    startingAt!: Time
}