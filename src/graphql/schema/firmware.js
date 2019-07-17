const { gql } = require('apollo-server')

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

const mutationResolvers = {}

mutationResolvers.publishFirmware = async (obj, { firmwareInput }, context) => {
	const { target, name, description, version, binary } = firmwareInput
	const { createReadStream, filename, mimetype, encoding } = await binary
	const firmware = new Firmware({
		target,
		name,
		description,
		version,
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
}
