const DataLoader = require('dataloader')

const User = require('./models/user')
const Device = require('./models/device')
const Measurement = require('./models/measurement')

const createDataLoaders = () => {
	const userByIdLoader = new DataLoader(userIds =>
		User.find({ _id: { $in: userIds } })
			.populate('devicesOwning')
			.populate('devicesManaging')
			.then(users => {
				for (const user of users) {
					userByEmailLoader.prime(user.email, user)
				}

				return users
			}),
	)

	const userByEmailLoader = new DataLoader(emails =>
		User.find({ email: { $in: emails } })
			.populate('devicesOwning')
			.populate('devicesManaging')
			.then(users => {
				for (const user of users) {
					userByIdLoader.prime(user.id, user)
				}

				return users
			}),
	)

	const deviceByIdLoader = new DataLoader(deviceIds =>
		Device.find({ _id: { $in: deviceIds } })
			.populate('owner')
			.populate('managers')
			.then(devices => {
				for (const device of devices) {
					deviceByMacLoader.prime(device.mac, device)
				}

				return devices
			}),
	)

	const deviceByMacLoader = new DataLoader(macs =>
		Device.find({ mac: { $in: macs } })
			.populate('owner')
			.populate('managers')
			.then(devices => {
				for (const device of devices) {
					deviceByIdLoader.prime(device.id, device)
				}

				return devices
			}),
	)

	const measurementByIdLoader = new DataLoader(measurementIds => {
		return Measurement.find({ _id: { $in: measurementIds } }).populate('device')
	})

	return {
		userByIdLoader,
		userByEmailLoader,
		deviceByIdLoader,
		deviceByMacLoader,
		measurementByIdLoader,
	}
}

module.exports = createDataLoaders
