const {
	getUserByToken,
	getDeviceByToken,
	getAuthTypeByToken,
} = require('../lib/token')
const createDataLoaders = require('../dataloaders')

const context = async ({ req, res, connection }) => {
	let context = {
		...createDataLoaders(),
		req,
		res,
		//                     ,-- for HTTP           ,-- for WS
		clientIp: (req && req.ip) || connection.remoteAddress,
	}

	// Authorization:
	try {
		// Format of header Authorization: <type> <content>

		const authHeader = req.headers.authorization
		const [authType, authContent] = authHeader.split(' ')
		switch (authType) {
			case 'Bearer': {
				const token = authContent

				context.user = await getUserByToken(token)
				context.device = await getDeviceByToken(token)

				context.authType = getAuthTypeByToken(token)

				break
			}

			case 'Mutual': {
				const deployKey = authContent
				if (deployKey === process.env.DEPLOY_KEY) {
					context.isDeploying = true
					context.authType = 'deployKey'
				}
				break
			}
		}
	} catch (err) {
		// authHeader is empty
	}

	// Is connected via WebSocket
	if (connection && connection.context) {
		context = {
			...context,
			...connection.context,
		}
	}

	if (context.user || context.device || context.isDeploying)
		context.isAuth = true

	return context
}

// This gets fired on every websocket connect-event ( = Subscription )
// What is returned gets added to connection.context in the above
// context function, and is thus added to context
const onConnect = async (connectionParams, webSocket) => {
	let context = {}

	if (connectionParams.authToken) {
		const token = connectionParams.authToken

		context.user = await getUserByToken(token)
		context.device = await getDeviceByToken(token)
	}

	return context
}

module.exports = {
	context,
	onConnect,
}
