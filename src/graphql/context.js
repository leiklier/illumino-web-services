const { getUserByToken, getDeviceByToken } = require('../lib/token')
const { userLoader, deviceLoader } = require('../dataloaders')

const context = async ({ req, connection }) => {
	let context = {
		userLoader,
		deviceLoader,
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

	// Is connected via WebSocket
	if (connection && connection.context) {
		context = {
			...context,
			...connection.context,
		}
	}

	return context
}

// This gets fired on every websocket connect-event ( = Subscription )
// What is returned gets added to connection.context in the above
// context function, and is thus added to context
const onConnect = async (connectionParams, webSocket) => {
	let context = {}

	// TODO: connectionParams is not tested, test in
	// ApolloClient and remove this comment when
	// confirmed working
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