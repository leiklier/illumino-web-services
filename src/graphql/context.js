const { getUserByToken, getDeviceByToken } = require('../util/token')
const { userLoader, deviceLoader } = require('../dataloaders')

const context = async ({ req }) => {
	let context = {
		userLoader,
		deviceLoader,
	}

	// Authorization:
	try {
		//* Format of header Authorization: <type> <content>

		const authHeader = req.headers.authorization
		const [authType, authContent] = authHeader.split(' ')
		switch (authType) {
			case 'Bearer': {
				const token = authContent
				context.user = await getUserByToken(token)
				context.device = await getDeviceByToken(token)
				break
			}

			case 'Mutual': {
				const deployKey = authContent
				if (deployKey === process.env.DEPLOY_KEY) {
					context.isDeploying = true
				}
				break
			}
		}
	} catch (err) {
		// authHeader is empty
	}

	return context
}

module.exports = context
