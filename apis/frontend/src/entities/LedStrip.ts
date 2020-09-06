import { ObjectType, Field, ID, Float, ArgsType, Int } from 'type-graphql'
import { prop as Property } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Animation } from './Animation'
import { Color } from './Color'
import { Geometry } from './Geometry'
import { Length } from 'class-validator'

@ArgsType()
export class LedStripArgs {
	@Field()
	@Length(12, 12)
	secret: string

	@Field(type => Int)
	ledStripIndex: number
}

@ObjectType({ description: 'A LedStrip belonging to a certain Device' })
export class LedStrip {
	@Field(() => ID)
	readonly id: ObjectId

	@Field()
	@Property()
	name!: string

	@Field()
	@Property()
	geometry!: Geometry

	@Field(() => Float)
	@Property({ default: 0 })
	brightness!: number

	@Field()
	@Property()
	color!: Color

	@Field()
	@Property()
	animation!: Animation
}
