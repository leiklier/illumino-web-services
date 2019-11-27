const { gql, ApolloError } = require('apollo-server-express')
const { isMACAddress } = require('validator')
const SHA256 = require('crypto-js/sha256')

const logger = require('../../logger')

const Device = require('../../models/device')
const Measurement = require('../../models/measurement')

const error = require('../errors')

const { DEPLOY_KEY } = process.env

const typeDefs = gql`
	type Device {
		id: ID!
		mac: String!
		secret: String! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER, ADMIN])
		name: String
		owner: User
		managers: [User!]!

		hasPin: Boolean!

		installedFirmware: Firmware!
			@requiresAuth(acceptsOnly: [SELF, ADMIN, OWNER, MANAGER])

		latestMeasurements(types: [MeasurementType!]): [Measurement!]!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		ledStrips: [LedStrip!]! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])
	}

	type DeviceType {
		model: DeviceModel!
		version: String!
	}

	enum DeviceModel {
		DEVICE
		ILLUMINODE
		ILLUMINODE_PLUS
	}

	input DeviceInput {
		mac: String!
		authKey: String!
		pin: PIN
		firmwareVersion: String!
		typeInput: DeviceTypeInput!
		ownerEmail: String
		name: String
	}

	input DeviceTypeInput {
		model: DeviceModel! = DEVICE
		version: String! = "v1.0.0"
	}
`

const DeviceResolver = {
	mac: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return null
		}
		return deviceFound.mac
	},
	secret: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return null
		}
		return deviceFound.secret
	},
	name: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return null
		}
		return deviceFound.name
	},
	owner: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return null
		}
		return deviceFound.owner
	},
	managers: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return []
		}
		return deviceFound.managers
	},
	hasPin: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return []
		}
		return deviceFound.hasPin
	},
	installedFirmware: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return null
		}

		return deviceFound.installedFirmware
	},
	latestMeasurements: async (device, { types }, context) => {
		const { deviceByIdLoader } = context
		const deviceFound = await deviceByIdLoader.load(device.id)

		let measurements = await Measurement.findLatestMeasurements(deviceFound)

		if (types) {
			measurements = measurements.filter(measurement =>
				types.includes(measurement.type),
			)
		}

		return measurements
	},
	ledStrips: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return []
		}

		return deviceFound.ledStrips
	},
}

const queryResolvers = {}
const mutationResolvers = {}

queryResolvers.device = async (obj, { mac, secret }, context) => {
	const { deviceByIdLoader, deviceByMacLoader } = context
	let device
	if (mac) {
		device = await deviceByMacLoader.load(mac)
	} else if (secret) {
		device = await Device.findOne({ secret })
	} else if (context.device) {
		device = await deviceByIdLoader.load(context.device.id)
	} else {
		return null
	}

	if (!device) {
		return null
	}

	return { id: device.id }
}

queryResolvers.devices = async (obj, { secrets }, context) => {
	const devices = await Device.find({ secret: { $in: secrets } })
	return devices
}

queryResolvers.secretIsValid = async (obj, { secret }, context) => {
	const deviceIsFound = await Device.findOne({ secret })
	return Boolean(deviceIsFound)
}

mutationResolvers.createDevice = async (obj, { deviceInput }, context) => {
	const {
		userByEmailLoader,
		deviceByMacLoader,
		firmwareByUniqueVersionLoader,
		clientIp,
	} = context

	if (!isMACAddress(deviceInput.mac)) {
		throw new ApolloError(error.MAC_IS_INVALID)
	}

	const existingDevice = await deviceByMacLoader.load(deviceInput.mac)
	if (existingDevice) {
		throw new ApolloError(error.DEVICE_DOES_ALREADY_EXIST)
	}

	const firmware = await firmwareByUniqueVersionLoader.load(
		`${deviceInput.typeInput.model}+${deviceInput.firmwareVersion}`,
	)

	if (!firmware) {
		throw new ApolloError(error.FIRMWARE_DOES_NOT_EXIST)
	}

	const device = new Device({
		lastSeenAt: new Date(),
		mac: deviceInput.mac,
		authKey: deviceInput.authKey,
		installedFirmware: firmware,
		type: {
			model: deviceInput.typeInput.model,
			version: {
				string: deviceInput.typeInput.version,
			},
		},
	})

	if (device.type.model === 'ILLUMINODE') {
		device.ledStrips = [{ name: 'Primary' }]
	} else if (device.type.model === 'ILLUMINODE_PLUS') {
		device.ledStrips = [{ name: 'Primary' }, { name: 'Secondary' }]
	}

	if (deviceInput.pin) {
		device.pin = deviceInput.pin.toString()
	}

	if (deviceInput.name) {
		device.name = deviceInput.name
	}

	if (!deviceInput.ownerEmail) {
		logger.info(`Device with mac ${device.mac} created`, {
			target: 'DEVICE',
			event: 'CREATION_SUCCEEDED',
			meta: { device: device.id, clientIp },
		})

		await device.save()

		return { id: device.id }
	}

	const owner = await userByEmailLoader.load(deviceInput.ownerEmail)
	if (!owner) {
		throw new ApolloError(error.USER_DOES_NOT_EXIST)
	}

	// Need to do two operations concurrently, so use transaction
	const session = await Device.startSession()
	session.startTransaction()
	try {
		device.owner = owner.id
		owner.devicesOwning.push(device.id)
		await owner.save()
		await device.save()

		return { id: device.id }
	} catch (err) {
		await session.abortTransaction()
		session.endSession()
		throw err
	}
}

mutationResolvers.claimDevice = async (obj, { mac }, context) => {
	const { userByIdLoader, deviceByMacLoader, clientIp } = context

	const ownerId = context.user.id

	const device = await deviceByMacLoader.load(mac)
	const owner = await userByIdLoader.load(ownerId)

	if (!device) {
		throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
	}

	if (!owner) {
		throw new ApolloError(error.USER_DOES_NOT_EXIST)
	}

	if (device.owner) {
		throw new ApolloError(error.DEVICE_IS_ALREADY_CLAIMED)
	}

	owner.devicesOwning.push(device.id)
	device.owner = ownerId

	// Need to update two documents concurrently
	const session = await Device.startSession()
	session.startTransaction()
	try {
		await owner.save()
		await device.save()

		logger.info(`Device with mac ${device.mac} authorized`, {
			target: 'DEVICE',
			event: 'CLAIM_SUCCEEDED',
			meta: { device: device.id, user: owner.id, clientIp },
		})
		return { id: device.id }
	} catch (err) {
		await session.abortTransaction()
		session.endSession()
		throw err
	}
}

mutationResolvers.setDevicePin = async (obj, { mac, pin }, context) => {
	const { deviceByMacLoader } = context

	const device = await deviceByMacLoader.load(mac)
	if (!device) {
		throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
	}

	device.pin = pin

	await device.save()
	return { id: device.id }
}

mutationResolvers.setDeviceName = async (obj, { mac, name }, context) => {
	const { deviceByMacLoader } = context
	const device = await deviceByMacLoader.load(mac)
	if (!device) {
		throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
	}

	device.name = name
	await device.save()

	return { id: device.id }
}

mutationResolvers.txBeacon = async (obj, args, context) => {
	const { deviceByIdLoader } = context
	const device = await deviceByIdLoader.load(context.device.id)

	device.lastSeenAt = new Date()
	await device.save()

	return device.lastSeenAt.toISOString()
}

module.exports = {
	typeDefs,
	queryResolvers,
	mutationResolvers,
	DeviceResolver,
}
