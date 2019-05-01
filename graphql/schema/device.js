const { gql } = require('apollo-server')

const User = require('../../models/user')
const Device = require('../../models/device')

const deviceTypeDefs = gql`
    type Device {
        _id: ID!
        owner: User!
        managers: [User!]!
    }
`

const deviceResolvers = {
    createDevice: async (obj, { ownerEmail }, context, info) => {
        if(!context.user) {
            throw new Error('User not logged in!')
        }

        if(!context.user.roles.includes('admin')) {
            throw new Error('Requires admin privileges!')
        }

        if(!ownerEmail) {
            const device = new Device()
            return result = await device.save()
        }

        const owner = await User.findOne({email: ownerEmail})
        if(!owner) {
            throw new Error('Owner does not exist!')
        }

        // Need to do to operations concurrently, so use transaction
        const session = await Device.startSession()
        session.startTransaction()
        try {
            const device = new Device({ owner: owner._id })
            owner.ownedDevices.push(device._id)
            await owner.save()
            return result = await device.save()

        } catch(err) {
            await session.abortTransaction()
            session.endSession()
            throw err
        }

    },
    activateDevice: async (obj, { deviceId }, context, info) => {
        if(!context.user) {
            throw new Error('User not logged in!')
        }
    
        const ownerId = context.user._id

        const device = await Device.findOne({ _id: deviceId })
        const owner = await User.findOne({ _id: ownerId})

        if (!device) {
            throw new Error('Device does not exist!');
        }

        if(!owner) {
            throw new Error('User does not exist!')
        }

        if(device.owner) {
            throw new Error('Device has already been activated!')
        }

        owner.ownedDevices.push(deviceId)
        device.owner = ownerId


        // Need to update two fields concurrently
        const session = await Device.startSession()
        session.startTransaction()
        try {
            await owner.save()
            return activatedDevice = await device.save()

        } catch(err) {
            await session.abortTransaction()
            session.endSession()
            throw err
        }
    }
}

module.exports = {
    deviceTypeDefs,
    deviceResolvers
}