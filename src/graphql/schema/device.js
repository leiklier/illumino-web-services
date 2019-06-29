const { gql } = require('apollo-server')
const { isMACAddress } = require('validator')

const Device = require('../../models/device')
const Measurement = require('../../models/measurement')

const typeDefs = gql`
	type Device {
		id: ID!
		mac: String!
		name: String
		owner: User
		managers: [User!]!

		latestMeasurements(types: [MeasurementType!]): [Measurement!]!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])
	}

	input DeviceInput {
		mac: String!
		authKey: String!
		pin: Int
		ownerEmail: String
		name: String
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
}

const queryResolvers = {}
const mutationResolvers = {}

queryResolvers.device = async (obj, { mac }, context) => {
	const { deviceByIdLoader, deviceByMacLoader } = context
	let device
	if (mac) {
		device = await deviceByMacLoader.load(mac)
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

mutationResolvers.createDevice = async (obj, { deviceInput }, context) => {
	const { userByEmailLoader, deviceByMacLoader } = context

	if (!isMACAddress(deviceInput.mac)) {
		throw new Error('Invalid MAC address')
	}

	const existingDevice = await deviceByMacLoader.load(deviceInput.mac)
	if (existingDevice) {
		throw new Error('Device exists already.')
	}

	const device = new Device({
		lastSeenAt: new Date(),
		mac: deviceInput.mac,
		authKey: deviceInput.authKey,
	})

	if (deviceInput.pin) {
		if (deviceInput.pin.toString().length > 4) {
			throw new Error('Pin too long. Should be 4 digits.')
		}
		device.pin = deviceInput.pin.toString()
	}

	if (deviceInput.name) {
		device.name = deviceInput.name
	}

	if (!deviceInput.ownerEmail) {
		await device.save()

		return { id: device.id }
	}

	const owner = await userByEmailLoader.load(deviceInput.ownerEmail)
	if (!owner) {
		throw new Error('Owner does not exist!')
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
	const { userByIdLoader, deviceByMacLoader } = context

	const ownerId = context.user.id

	const device = await deviceByMacLoader.load(mac)
	const owner = await userByIdLoader.load(ownerId)

	if (!device) {
		throw new Error('Device does not exist!')
	}

	if (!owner) {
		throw new Error('User does not exist!')
	}

	if (device.owner) {
		throw new Error('Device has already been claimed!')
	}

	owner.devicesOwning.push(device.id)
	device.owner = ownerId

	// Need to update two documents concurrently
	const session = await Device.startSession()
	session.startTransaction()
	try {
		await owner.save()
		await device.save()
		return { id: device.id }
	} catch (err) {
		await session.abortTransaction()
		session.endSession()
		throw err
	}
}

mutationResolvers.setDevicePin = async (obj, { mac, pin }, context) => {
	const { deviceByMacLoader } = context

	if (pin.toString().length > 4) {
		throw new Error('Pin too long. Should be 4 digits.')
	}

	const device = await deviceByMacLoader.load(mac)
	if (!device) {
		throw new Error('Device does not exist!')
	}

	device.pin = pin

	await device.save()
	return { id: device.id }
}

mutationResolvers.setDeviceName = async (obj, { mac, name }, context) => {
	const { deviceByMacLoader } = context
	const device = await deviceByMacLoader.load(mac)
	if (!device) {
		throw new Error('Device does not exist!')
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
