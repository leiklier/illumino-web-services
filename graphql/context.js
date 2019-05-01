const { getUserByToken } = require('../helpers')

const context = async ({req}) => {
    // Format of header Authorization: Bearer <token>
    const authHeader = req.headers.authorization

    if(!authHeader) {
        return false
    }

    const token = authHeader.split(' ')[1]
    
    const user = await getUserByToken(token)

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