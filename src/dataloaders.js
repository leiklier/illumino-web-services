const DataLoader = require('dataloader')

const User = require('./models/user')
const Device = require('./models/device')
const Firmware = require('./models/firmware')
const Measurement = require('./models/measurement')

const createDataLoaders = () => {
	const userByIdLoader = new DataLoader(userIds =>
		User.find({ _id: { $in: userIds } })
			.populate('devicesOwning')
			.populate('devicesManaging')
			.then(users => {
				let usersById = {}
				for (const user of users) {
					usersById[user._id] = user
					userByEmailLoader.prime(user.email, user)
				}

				// Need to return undefined for queries with empty response:
				return userIds.map(userId => usersById[userId])
			}),
	)

	const userByEmailLoader = new DataLoader(emails =>
		User.find({ email: { $in: emails } })
			.populate('devicesOwning')
			.populate('devicesManaging')
			.then(users => {
				let usersByEmail = {}
				for (const user of users) {
					usersByEmail[user.email] = user
					userByIdLoader.prime(user.id, user)
				}

				// Need to return undefined for queries with empty response:
				return emails.map(email => usersByEmail[email])
			}),
	)

	const deviceByIdLoader = new DataLoader(deviceIds =>
		Device.find({ _id: { $in: deviceIds } })
			.populate('owner')
			.populate('managers')
			.then(devices => {
				let devicesById = {}
				for (const device of devices) {
					devicesById[device._id] = device
					deviceByMacLoader.prime(device.mac, device)
				}

				// Need to return undefined for queries with empty response:
				return deviceIds.map(deviceId => devicesById[deviceId])
			}),
	)

	const deviceByMacLoader = new DataLoader(macs =>
		Device.find({ mac: { $in: macs } })
			.populate('owner')
			.populate('managers')
			.then(devices => {
				let devicesByMac = {}
				for (const device of devices) {
					devicesByMac[device.mac] = device
					deviceByIdLoader.prime(device.id, device)
				}

				// Need to return undefined for queries with empty response:
				return macs.map(mac => devicesByMac[mac])
			}),
	)

	const firmwareByIdLoader = new DataLoader(firmwareIds =>
		Firmware.find({ _id: { $in: firmwareIds } }).then(firmwares => {
			let firmwaresById = {}
			for (const firmware of firmwares) {
				firmwaresById[firmware.version] = firmware
				firmwareByUniqueVersionLoader.prime(
					`${firmware.target}+${firmware.version}`,
					firmware,
				)
			}

			// Need to return undefined for queries with empty response:
			return firmwareIds.map(firmwareId => firmwaresById[firmwareId])
		}),
	)

	const firmwareByUniqueVersionLoader = new DataLoader(uniqueVersions => {
		// uniqueVersion = `${target}+${version}`, i.e. `DEVICE+v4.2.5`
		let uniqueVersionTuples = [] // [{target, version}]

		for (const uniqueVersionString of uniqueVersions) {
			const [target, version] = uniqueVersionString.split('+')
			uniqueVersionTuples.push({ target, version })
		}

		return Firmware.find()
			.or(uniqueVersionTuples)
			.then(firmwares => {
				let firmwaresByUniqueVersion = {}

				for (const firmware of firmwares) {
					firmwaresByUniqueVersion[
						`${firmware.target}+${firmware.version}`
					] = firmware

					firmwareByIdLoader.prime(firmware.id, firmware)
				}

				// Need to return undefined for queries with empty response:
				return uniqueVersions.map(
					uniqueVersion => firmwaresByUniqueVersion[uniqueVersion],
				)
			})
	})

	const measurementByIdLoader = new DataLoader(measurementIds =>
		Measurement.find({ _id: { $in: measurementIds } })
			.populate('device')
			.then(measurements => {
				let measurementsById = {}
				for (const measurement of measurements) {
					measurementsById[measurement._id] = measurement
				}

				// Need to return undefined for queries with empty response:
				return measurementIds.map(
					measurementId => measurementsById[measurementId],
				)
			}),
	)

	return {
		userByIdLoader,
		userByEmailLoader,
		deviceByIdLoader,
		deviceByMacLoader,
		firmwareByIdLoader,
		firmwareByUniqueVersionLoader,
		measurementByIdLoader,
	}
}

module.exports = createDataLoaders
