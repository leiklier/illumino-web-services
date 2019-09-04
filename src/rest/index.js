const enableLatestFirmwareBinaryEndpoint = require('./endpoints/latest-firmware-binary')

module.exports = app => {
	enableLatestFirmwareBinaryEndpoint(app)
}
