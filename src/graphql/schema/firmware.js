const { gql } = require('apollo-server-express')

const Firmware = require('../../models/firmware')

const typeDefs = gql`
	enum FirmwareTarget {
		DEVICE
	}

	input FirmwareInput {
		target: FirmwareTarget!
		name: String!
		description: String
		version: String!
		binary: Upload!
	}

	type Firmware {
		id: ID!
		target: FirmwareTarget!
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

const mutationResolvers = {}

mutationResolvers.publishFirmware = async (obj, { firmwareInput }, context) => {
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

	return true
}

module.exports = {
	typeDefs,
	mutationResolvers,
	FirmwareResolver,
}
