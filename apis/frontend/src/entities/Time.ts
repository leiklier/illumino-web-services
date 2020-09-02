import { ObjectType, InputType, Field, Int } from 'type-graphql'
import { prop as Property } from '@typegoose/typegoose'

@InputType('TimeInput')
@ObjectType({ description: 'Describes the time using hours and minutes' })
export class Time {
    @Field(() => Int)
    @Property({ default: 0 })
    hour!: number

    @Field(() => Int)
    @Property({ default: 0 })
    minute!: number
}