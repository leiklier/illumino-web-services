const { gql } = require('apollo-server')

const User = require('../../models/user')
const Device = require('../../models/device')
const { loadDeviceById } = require('../loaders')

const deviceTypeDefs = gql`
    type Device {
        _id: ID!
        owner: User
        managers: [User]!
    }
`

const deviceResolvers = {
    createDevice: async (obj, { ownerEmail }, context, info) => {
        if(!context.user) {
            throw new Error('User not logged in!')
        }

        if(!context.user.isAdmin) {
            throw new Error('Requires admin privileges!')
        }

        if(!ownerEmail) {
            const device = new Device()
            await device.save()
            // Admin context, so allow infinite nesting:
            return loadDeviceById(device.id)
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
            owner.devicesOwning.push(device._id)
            await owner.save()
            await device.save()
            // Admin context, so allow infinite nesting:
            return loadDeviceById(device.id)

        } catch(err) {
            await session.abortTransaction()
            session.endSession()
            throw err
        }

    },
    claimDevice: async (obj, { deviceId }, context, info) => {
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
            throw new Error('Device has already been claimed!')
        }

        owner.devicesOwning.push(deviceId)
        device.owner = ownerId


        // Need to update two fields concurrently
        const session = await Device.startSession()
        session.startTransaction()
        try {
            await owner.save()
            await device.save()
            return context.user.isAdmin ?
                loadDeviceById(device.id) :
                loadDeviceById(device.id, 2)

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