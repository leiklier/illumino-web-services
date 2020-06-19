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
			.populate('installedFirmware')
			.then(devices => {
				let devicesById = {}
				for (const device of devices) {
					devicesById[device._id] = device
					deviceBySecretLoader.prime(device.secret, device)
				}

				// Need to return undefined for queries with empty response:
				return deviceIds.map(deviceId => devicesById[deviceId])
			}),
	)

	const deviceBySecretLoader = new DataLoader(secrets =>
		Device.find({ secret: { $in: secrets } })
			.populate('owner')
			.populate('managers')
			.populate('installedFirmware')
			.then(devices => {
				let devicesBySecret = {}
				for (const device of devices) {
					devicesBySecret[device.secret] = device
					deviceByIdLoader.prime(device.id, device)
				}

				// Need to return undefined for queries with empty response:
				return secrets.map(secret => devicesBySecret[secret])
			}),
	)

	const firmwareByIdLoader = new DataLoader(firmwareIds =>
		Firmware.find({ _id: { $in: firmwareIds } }).then(firmwares => {
			let firmwaresById = {}
			for (const firmware of firmwares) {
				firmwaresById[firmware.id] = firmware

				const versionString = firmware.version.string
				firmwareByUniqueVersionLoader.prime(
					`${firmware.target}+${versionString}`,
					firmware,
				)
			}

			// Need to return undefined for queries with empty response:
			return firmwareIds.map(firmwareId => firmwaresById[firmwareId])
		}),
	)

	const firmwareByUniqueVersionLoader = new DataLoader(uniqueVersions => {
		// uniqueVersion = `${target}+${version}`, i.e. `DEVICE+v4.2.5`
		let uniqueVersionTuples = [] // [{target, version: {major, minor, patch}}]

		for (const uniqueVersionString of uniqueVersions) {
			const [target, versionString] = uniqueVersionString.split('+')
			const [major, minor, patch] = versionString.substring(1).split('.')
			uniqueVersionTuples.push({
				target,
				'version.major': major,
				'version.minor': minor,
				'version.patch': patch,
			})
		}

		return Firmware.find()
			.or(uniqueVersionTuples)
			.then(firmwares => {
				let firmwaresByUniqueVersion = {}

				for (const firmware of firmwares) {
					const versionString = firmware.version.string
					firmwaresByUniqueVersion[
						`${firmware.target}+${versionString}`
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
		deviceBySecretLoader,
		firmwareByIdLoader,
		firmwareByUniqueVersionLoader,
		measurementByIdLoader,
	}
}

module.exports = createDataLoaders
