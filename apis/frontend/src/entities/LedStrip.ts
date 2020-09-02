import { ObjectType, Field, ID, Float } from 'type-graphql'
import { prop as Property } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Animation } from './Animation'
import { Color } from './Color'
import { Geometry } from './Geometry'

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
