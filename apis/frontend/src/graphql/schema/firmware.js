const { gql, withFilter } = require('apollo-server-express')

const logger = require('../../logger')

const Firmware = require('../../models/firmware')

const pubsub = require('../pubsub')

const typeDefs = gql`
	input FirmwareInput {
		target: DeviceModel!
		name: String!
		description: String
		version: String!
		binary: Upload!
	}

	type Firmware {
		id: ID!
		target: DeviceModel!
		name: String!
		description: String
		createdAt: DateTime!
		version: String!
		isLatest: Boolean!
	}
`

const FirmwareResolver = {
	target: async (firmware, args, context) => {
		const { firmwareByIdLoader } = context

		const firmwareFound = await firmwareByIdLoader.load(firmware.id)
		if (!firmwareFound) {
			return null
		}

		return firmwareFound.target
	},
	name: async (firmware, args, context) => {
		const { firmwareByIdLoader } = context

		const firmwareFound = await firmwareByIdLoader.load(firmware.id)
		if (!firmwareFound) {
			return null
		}

		return firmwareFound.name
	},
	description: async (firmware, args, context) => {
		const { firmwareByIdLoader } = context

		const firmwareFound = await firmwareByIdLoader.load(firmware.id)
		if (!firmwareFound) {
			return null
		}

		return firmwareFound.description || null
	},
	createdAt: async (firmware, args, context) => {
		const { firmwareByIdLoader } = context

		const firmwareFound = await firmwareByIdLoader.load(firmware.id)
		if (!firmwareFound) {
			return null
		}

		return firmwareFound.createdAt
	},
	version: async (firmware, args, context) => {
		const { firmwareByIdLoader } = context

		const firmwareFound = await firmwareByIdLoader.load(firmware.id)
		if (!firmwareFound) {
			return null
		}

		return firmwareFound.version.string
	},
	isLatest: async (firmware, args, context) => {
		const { firmwareByIdLoader } = context

		const firmwareFound = await firmwareByIdLoader.load(firmware.id)
		if (!firmwareFound) {
			return null
		}

		return await Firmware.isLatest(firmwareFound)
	},
}

const subscriptionResolvers = {}
const mutationResolvers = {}

subscriptionResolvers.newFirmwares = {
	subscribe: withFilter(
		() => pubsub.asyncIterator('newFirmwares'),
		async (payload, args, context) => {
			const { firmwareByIdLoader } = context
			const firmware = await firmwareByIdLoader.load(payload.newFirmwares.id)

			// TODO: Add some logic here to check that target is matching

			return true
		},
	),
}

mutationResolvers.publishFirmware = async (obj, { firmwareInput }, context) => {
	const { clientIp } = context
	const { target, name, description, version, binary } = firmwareInput
	const { createReadStream, filename, mimetype, encoding } = await binary

	const firmware = new Firmware({
		target,
		name,
		description,
		version: { string: version },
	})

	// TODO: Verify mimetype and encoding to match hex, etc

	const readStream = createReadStream()
	await firmware.writeBinary(filename, readStream)
	readStream.close()
	await firmware.save()

	logger.info(
		`Firmware with version ${version} for ${target} has been published`,
		{
			target: 'FIRMWARE',
			event: 'PUBLISH_SUCCEEDED',
			meta: {
				clientIp,
			},
		},
	)

	// TODO: Should return the firmware, and not boolean
	return true
}

module.exports = {
	typeDefs,
	subscriptionResolvers,
	mutationResolvers,
	FirmwareResolver,
}
