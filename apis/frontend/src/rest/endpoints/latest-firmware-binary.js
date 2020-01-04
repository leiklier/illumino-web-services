const HttpStatus = require('http-status-codes')
const Firmware = require('../../models/firmware')
const { getDeviceByToken, getAuthTypeByToken } = require('../../lib/token')
const error = require('../errors')

module.exports = app => {
	//* This endpoint requires the client being authorized
	//* as a `Device` using either authkey or DeployKey

	app.get('/latest-firmware-binary', async (req, res) => {
		let authorizedDevice = null

		//* --------------- AUTHORIZATION ---------------
		try {
			// Format of header Authorization: Bearer <token>

			const authHeader = req.headers.authorization

			if (!authHeader) throw new Error(error.NOT_AUTHENTICATED)

			const [authType, token] = authHeader.split(' ')
			if (!token) throw new Error(error.NOT_AUTHENTICATED)
			if (authType !== 'Bearer') throw new Error(error.INVALID_AUTH_TYPE)

			authorizedDevice = await getDeviceByToken(token)
			if (!authorizedDevice) throw new Error(error.DEVICE_DOES_NOT_EXIST)

			const tokenAuthType = getAuthTypeByToken(token)
			if (!['authKey', 'deployKey'].includes(tokenAuthType))
				throw new Error(error.NOT_AUTHORIZED)
		} catch (err) {
			// Invalid credentials
			// TODO: Check that we only sends back allowed errors
			res.status(HttpStatus.UNAUTHORIZED).send({ error: err.message })
			return
		}
		//* ---------------------------------------------

		const latestFirmware = await Firmware.findLatestFirmware('DEVICE')
		const filename = latestFirmware.uniqueVersion
		const binaryReadStream = await latestFirmware.getBinaryReadStream()

		res.setHeader('Content-disposition', `attachment; filename="${filename}"`)
		//                                      ,---- Commonly used for binaries
		res.setHeader('Content-type', 'application/octet-stream')

		binaryReadStream.pipe(res)
	})
}
