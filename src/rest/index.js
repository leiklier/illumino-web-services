const enableWebhooksEndpoint = require('./endpoints/webhooks')
const enableLatestFirmwareBinaryEndpoint = require('./endpoints/latest-firmware-binary')

module.exports = app => {
	enableWebhooksEndpoint(app)
	enableLatestFirmwareBinaryEndpoint(app)
}
