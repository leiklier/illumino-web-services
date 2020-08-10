import { ObjectType, Field, ID } from 'type-graphql'
import { prop as Property, getModelForClass } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

@ObjectType({ description: "A physical device of the Illumino Family" })
export class Device {
    @Field(()=> ID)
    readonly id: ObjectId

    @Field() 
    @Property()
    mac: string

    @Field()
    @Property()
    secret: string

    @Field({ nullable: true})
    @Property()
    name?: string

    @Property()
    pin: string
}

export const DeviceModel = getModelForClass(Device)