import { gql, withFilter } from 'apollo-server-express'

import logger from '../../logger'

import Firmware from '../../models/firmware'

export const typeDefs = gql`
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

export const FirmwareResolver = {
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

export const subscriptionResolvers = {}
export const mutationResolvers = {
	publishFirmware: async (obj, { firmwareInput }, context) => {
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
}

