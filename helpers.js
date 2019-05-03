const jwt = require('jsonwebtoken')
const User = require('./models/user')

const getUserIdByToken = token => {
    if(!token || token === '') {
        return false
    }

    let decodedToken
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch(err) {
        return false
    }
    if(!decodedToken) {
        return false
    }

    return decodedToken.userId
}

const getTokenByUserId = userId => {
    return token = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    )
}

const getDeviceIdByToken = token => {
    if(!token || token === '') {
        return false
    }

    let decodedToken
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch(err) {
        return false
    }
    if(!decodedToken) {
        return false
    }

    return decodedToken.deviceId
}

const getTokenByDeviceId = deviceId => {
    return token = jwt.sign(
        { deviceId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )   
}

module.exports = {
    getTokenByUserId,
    getUserIdByToken,
    getTokenByDeviceId,
    getDeviceIdByToken
}