const {
	getUserByToken,
	getDeviceByToken,
	getTokenPayload,
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

	let accessToken

	// HTTP authentication:
	try {
		// Format of header Authorization: <type> <content>
		const authHeader = req.headers.authorization
		const [authType, authContent] = authHeader.split(' ')

		switch (authType) {
			case 'Bearer': {
				accessToken = authContent
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

	// WebSocket authentication:
	// Is connected via WebSocket
	if (connection && connection.context) {
		accessToken = connection.context.accessToken
	}

	if (accessToken) {
		const { userByIdLoader, deviceByIdLoader } = context
		const tokenPayload = getTokenPayload(accessToken)
		if (tokenPayload.user) {
			context.user = await userByIdLoader.load(tokenPayload.user.id)
		}
		if (tokenPayload.device) {
			context.device = await deviceByIdLoader.load(tokenPayload.device.id)
		}

		context.authType = getAuthTypeByToken(accessToken)
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
		context.accessToken = connectionParams.authToken
	}

	return context
}

module.exports = {
	context,
	onConnect,
}
