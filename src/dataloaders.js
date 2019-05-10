const DataLoader = require('dataloader')

const User = require('./models/user')
const Device = require('./models/device')

const userLoader = new DataLoader(userIds => {
	return User.find({ _id: { $in: userIds } })
		.populate('devicesOwning', '_id')
		.populate('devicesManaging', '_id')
})

const deviceLoader = new DataLoader(deviceIds => {
	return Device.find({ _id: { $in: deviceIds } })
		.populate('owner', '_id roles')
		.populate('managers', '_id roles')
})

module.exports = {
	userLoader,
	deviceLoader,
}
