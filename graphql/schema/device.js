const { gql } = require('apollo-server')

const User = require('../../models/user')
const Device = require('../../models/device')
const { loadDeviceById } = require('../loaders')

const deviceTypeDefs = gql`
    type Device {
        _id: ID!
        name: String
        owner: User
        managers: [User]!
    }

    input DeviceInput {
        ownerEmail: String
        name: String
    }
`

const deviceResolvers = {
    createDevice: async (obj, { deviceInput }, context, info) => {
        // Permittable by admins
        if(!context.user) {
            throw new Error('User not logged in!')
        }

        if(!context.user.isAdmin) {
            throw new Error('Requires admin privileges!')
        }

        const device = new Device()

        if(!deviceInput) {
            await device.save()
            // Admin context, so allow infinite nesting:
            return loadDeviceById(device.id)
        }

        if(deviceInput.name) {
            device.name = deviceInput.name
        }

        if(!deviceInput.ownerEmail) {
            await device.save()
            // Admin context, so allow infinite nesting:
            return loadDeviceById(device.id)
        }

        const owner = await User.findOne({email: deviceInput.ownerEmail})
        if(!owner) {
            throw new Error('Owner does not exist!')
        }

        // Need to do to operations concurrently, so use transaction
        const session = await Device.startSession()
        session.startTransaction()
        try {
            device.owner = owner._id
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
        // Permittable by users
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
    },
    setDeviceName: async (obj, { deviceId, name }, context, info) => {
        // Permittable by deviceOwners and admins
        if(!context.user) {
            throw new Error('User not logged in!')
        }
        
        const device = await Device
            .findOne({_id: deviceId})
            .populate('owner', '_id')
        if(!device) {
            throw new Error('Device does not exist!')
        }

        if(!(context.isAdmin || context.user._id === device.owner.id)) {
            throw new Error('User not authorized!')
        }

        device.name = name
        await device.save()

        return context.isAdmin ?
            loadDeviceById(device.id) :
            loadDeviceById(device.id, 2)
    }
}

module.exports = {
    deviceTypeDefs,
    deviceResolvers
}