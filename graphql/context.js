const User = require('../models/user')
const { getUserIdByToken } = require('../helpers')

const context = async ({req}) => {
    // Format of header Authorization: Bearer <token>
    const authHeader = req.headers.authorization

    if(!authHeader) {
        return false
    }

    const token = authHeader.split(' ')[1]
    
    const userId = getUserIdByToken(token)
    
    if(!userId) {
        // Token has expired
        return false
    }

    const user = await User.findOne({_id: userId})

    if(!user) {
        return false
    }

    return {
        user: {
            _id: user._id,
            roles: user.roles
        }
    }
}

module.exports = context