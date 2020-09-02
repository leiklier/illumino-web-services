import {
	registerEnumType,
	ObjectType,
	Field,
	Int,
	InputType,
} from 'type-graphql'
import { prop as Property } from '@typegoose/typegoose'

export enum Corner {
	topRight = 'topRight',
	bottomRight = 'bottomRight',
	bottomLeft = 'bottomLeft',
	topLeft = 'topLeft',
}

registerEnumType(Corner, {
	name: 'Corner',
	description: 'A geometric 2D corner',
})

@InputType('DimensionsInput')
@ObjectType({
	description: `How many LEDs the LedStrip occupies in each of the directions`,
})
export class Dimensions {
	@Field(() => Int, { nullable: true })
	@Property({ default: 10 })
	top?: number

	@Field(() => Int, { nullable: true })
	@Property({ default: 10 })
	right?: number

	@Field(() => Int, { nullable: true })
	@Property({ default: 10 })
	bottom?: number

	@Field(() => Int, { nullable: true })
	@Property({ default: 10 })
	left?: number
}

@InputType('GeometryInput')
@ObjectType({ description: 'Attributes describing the shape of a LedStrip' })
export class Geometry {
	@Field()
	@Property()
	dimensions!: Dimensions

	@Field(() => Corner)
	@Property({ enum: Corner, default: Corner.bottomLeft })
	startCorner!: Corner
}
