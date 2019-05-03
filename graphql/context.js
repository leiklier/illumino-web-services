const User = require('../models/user')
const Device = require('../models/device')
const { getUserIdByToken, getDeviceIdByToken } = require('../helpers')

const context = async ({req}) => {
    // Format of header Authorization: Bearer <token>
    const authHeader = req.headers.authorization

    const userContext = await getUserContextByAuthHeader(authHeader)
    const deviceContext= await getDeviceContextByAuthHeader(authHeader)

    const context = {
        user: userContext,
        device: deviceContext
    }

    return context
}

const getUserContextByAuthHeader = async authHeader => {
    var authType, token
    try {
        [authType, token] = authHeader.split(' ')
    } catch(err) {
        // authHeader is empty
        return {}
    }
    if(!authType === 'Bearer') {
        return {}
    }

    const userId = getUserIdByToken(token)
    
    if(!userId) {
        // Token has expired
        return {}
    }

    const user = await User.findOne({_id: userId})

    if(!user) {
        return {}
    }

    return {
        isAuth: true,
        _id: user.id,
        roles: user.roles,
        isAdmin: Boolean(user.roles.includes('admin'))
    }
}

const getDeviceContextByAuthHeader = async authHeader => {
    var authType, token
    try {
        [authType, token] = authHeader.split(' ')
    } catch(err) {
        // authHeader is empty
        return {}
    }
    if(!authType === 'Bearer') {
        return {}
    }
    
    const deviceId = getDeviceIdByToken(token)
    
    if(!deviceId) {
        // Token has expired
        return {}
    }

    const device = await Device.findOne({_id: deviceId})

    if(!device) {
        return {}
    }

    return {
        isAuth: true,
        _id: device.id
    }
}

module.exports = context