const enableLatestFirmwareEndpoint = require('./endpoints/latest-firmware')

module.exports = app => {
	enableLatestFirmwareEndpoint(app)
}
