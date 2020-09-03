import { ObjectType, Field, Float, InputType } from 'type-graphql'
import { prop as Property } from '@typegoose/typegoose'

@InputType('ColorInput')
@ObjectType({ description: 'The color which is shown on a LedStrip' })
export class Color {
	@Field(() => Float)
	@Property({ required: true, default: 0, min: 0, max: 360 })
	hue: number

	@Field(() => Float)
	@Property({ required: true, default: 0, min: 0, max: 1 })
	saturation: number
}
