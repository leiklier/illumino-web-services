import { ObjectType, Field, registerEnumType, Float } from 'type-graphql'
import { prop as Property } from '@typegoose/typegoose'

export enum AnimationType {
	MANUAL = 'MANUAL',
	VIVID = 'VIVID',
	GLOW = 'GLOW',
	SPARKS = 'SPARKS',
	FIREPLACE = 'FIREPLACE',
}

registerEnumType(AnimationType, {
	name: 'AnimationType',
	description: 'Different kinds of animation patterns',
})

@ObjectType({ description: 'The animation properties of a LedStrip' })
export class Animation {
	@Field(() => AnimationType)
	@Property({ enum: AnimationType })
	type!: AnimationType

	@Field(() => Float)
	@Property()
	speed!: number
}
