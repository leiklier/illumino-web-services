import { ObjectType, Field, ID } from 'type-graphql'
import { prop as Property, getModelForClass } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

@ObjectType({ description: "A physical device of the Illumino Family" })
export class Device {
    @Field(()=> ID)
    readonly id: ObjectId

    @Field() 
    @Property({ required: true })
    mac: string

    @Field()
    @Property({ required: true })
    secret: string

    @Field({ nullable: true})
    @Property({ required: true })
    name?: string

    @Property()
    pin?: string
}

export const DeviceModel = getModelForClass(Device)