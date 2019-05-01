const User = require('./models/user')
const Device = require('./models/device')

const getUserById = async (userId, nestingLevel) => {
    if(typeof nestingLevel !== 'undefined' && nestingLevel === 0) {
        return userId
    }

    try {
        const user = await User.findOne({_id: userId})
        return populateUser(user, --nestingLevel)
    } catch (err) {
        throw err
    }
}

const getUsersById = async (userIds, nestingLevel) => {
    if(typeof nestingLevel !== 'undefined' && nestingLevel === 0) {
        return userIds
    }

    try {
        const users  = await User.find({ _id: { $in: userIds } })
        return populatedUsers = users.map(user => populateUser(user, --nestingLevel))
    } catch(err) {
        throw err
    }
}

const getDeviceById = async (deviceId, nestingLevel) => {
    if(typeof nestingLevel !== 'undefined' && nestingLevel === 0) {
        return deviceId
    }

    try {
        const device = await Device.findOne({_id: deviceId})
        return populateDevice(device, --nestingLevel)
    } catch (err) {
        throw err
    }
}

const getDevicesById = async (deviceIds, nestingLevel) => {
    if(typeof nestingLevel !== 'undefined' && nestingLevel === 0) {
        return deviceIds
    }

    try {
        const devices  = await Device.find({ _id: { $in: deviceIds } })
        return populatedDevices = devices.map(device => populateDevice(device, --nestingLevel))
    } catch(err) {
        throw err
    }
}

const populateUser = (user, nestingLevel) => {
    return {
        ...user.toObject(),
        password: null,
        ownedDevices: () => getDevicesById(user.ownedDevices, nestingLevel),
        managedDevices: () => getDevicesById(user.managedDevices, nestingLevel)
    }
}

const populateDevice = (device, nestingLevel) => {
    return {
        ...device.toObject(),
        owner: () => getUserById(device.owner, nestingLevel),
        managers: () => getUsersById(device.managers, nestingLevel)
    }
}

module.exports = {
    getUserById,
    getUsersById,
    getDeviceById,
    getDevicesById
}