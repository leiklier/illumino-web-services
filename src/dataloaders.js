const DataLoader = require('dataloader')

const User = require('./models/user')
const Device = require('./models/device')
const Measurement = require('./models/measurement')

const userLoader = new DataLoader(userIds => {
	return User.find({ _id: { $in: userIds } })
		.populate('devicesOwning')
		.populate('devicesManaging')
})

const deviceLoader = new DataLoader(deviceIds => {
	return Device.find({ _id: { $in: deviceIds } })
		.populate('owner')
		.populate('managers')
})

const measurementLoader = new DataLoader(measurementIds => {
	return Measurement.find({ _id: { $in: measurementIds } }).populate('device')
})

module.exports = {
	userLoader,
	deviceLoader,
	measurementLoader,
}
