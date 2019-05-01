const jwt = require('jsonwebtoken')
const User = require('./models/user')

const getUserByToken = async token => {
    if(!token || token === '') {
        return await Promise.resolve(false)
    }

    let decodedToken, user
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decodedToken)
        user = await User.findOne({_id: decodedToken.userId})
    } catch(err) {
        return await Promise.resolve(false)
    }
    if(!decodedToken) {
        return await Promise.resolve(false)
    }

    return user
}

module.exports = {
    getUserByToken
}