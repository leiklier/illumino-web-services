import { Request, Response } from 'express'
import { User, UserModel } from './entities/User'
import { Device, DeviceModel } from './entities/Device'
import { getTokenPayload, getAuthTypeByToken } from './lib/token'
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer'

export interface Context {
	req: Request
	res: Response
	clientIp: string

	user?: User | null
	device?: Device | null

	isAuth: boolean
	isDeploying: boolean
	authType?: string

	accessToken?: string
}

export async function context({
	req,
	res,
	connection,
}: ExpressContext): Promise<Context> {
	let context: Context = {
		req,
		res,
		//                     ,-- for HTTP
		clientIp: req && req.ip,

		isAuth: false,
		isDeploying: false,
	}

	let accessToken: string | undefined

	// HTTP authentication:
	try {
		// Format of header Authorization: <authType> <authContent>
		const authHeader = req.headers.authorization!
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
		const tokenPayload = getTokenPayload(accessToken)

		if (tokenPayload?.user) {
			context.user = await UserModel.findById(tokenPayload.user.id)
		}
		if (tokenPayload?.device) {
			context.device = await DeviceModel.findById(tokenPayload.device.id)
		}

		context.authType = getAuthTypeByToken(accessToken)
	}

	if (context.user || context.device || context.isDeploying)
		context.isAuth = true

	return context
}
