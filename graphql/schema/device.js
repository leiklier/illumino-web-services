const { gql } = require('apollo-server')
const bcrypt = require('bcryptjs')
const { isMACAddress } = require('validator')

const User = require('../../models/user')
const Device = require('../../models/device')
const { loadDeviceById } = require('../loaders')

const deviceTypeDefs = gql`
    type Device {
        _id: ID!
        mac: String!
        authKey: String
        pin: String
        name: String
        owner: User
        managers: [User]!
    }

    input DeviceInput {
        mac: String!
        authKey: String!
        pin: Int
        ownerEmail: String
        name: String
    }
`

const deviceResolvers = {
    createDevice: async (obj, { deviceInput }, context, info) => {
        // Permittable by all users

        // [TODO]: Require some type of key
        // in Authorization header in order
        // to allow operation.

        if(!isMACAddress(deviceInput.mac)) {
            throw new Error('Invalid MAC address')
        }

        const existingDevice = await Device.findOne({ mac: deviceInput.mac })
        if(existingDevice) {
            throw new Error('Device exists already.')
        }

        const device = new Device()
        device.mac = deviceInput.mac
        device.authKey = await bcrypt.hash(deviceInput.authKey, 12)

        if(deviceInput.pin) {
            if(deviceInput.pin.toString().length > 4) {
                throw new Error('Pin too long. Should be 4 digits.')
            }
            device.pin = await bcrypt.hash(deviceInput.pin, 12)
        }

        if(deviceInput.name) {
            device.name = deviceInput.name
        }

        if(!deviceInput.ownerEmail) {
            await device.save()

            return context.isAdmin ? 
                loadDeviceById(device.id) :
                loadDeviceById(device.id, 2)
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

            return context.isAdmin ?
                loadDeviceById(device.id) :
                loadDeviceById(device.id, 2)
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