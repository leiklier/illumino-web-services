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
    activateDevice: async (obj, { deviceId }, context, info) => {
        if(!context.user) {
            throw new Error('Not authorized')
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