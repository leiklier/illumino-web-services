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

const getTokenByUserId = async userId => {
    const user = await User.findOne({ _id: userId })
    if (!user) {
        throw new Error('User does not exist!');
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h'
        }
    )

    return token
}

module.exports = {
    getTokenByUserId,
    getUserIdByToken
}