const { gql, withFilter } = require('apollo-server')

const Measurement = require('../../models/measurement')

const pubsub = require('../pubsub')

const typeDefs = gql`
	type Measurement {
		id: ID!
		device: Device!
		type: MeasurementType!
		environment: MeasurementEnvironment
		value: Float!
		createdAt: DateTime!
		updatedAt: DateTime
	}

	enum MeasurementType {
		TEMPERATURE
		HUMIDITY
		ILLUMINANCE
	}

	enum MeasurementEnvironment {
		OUTDOOR
		INDOOR
		INSIDE
		OUTSIDE
	}
`

const MeasurementResolver = {
	device: async (measurement, args, context) => {
		const { measurementByIdLoader } = context

		const measurementFound = await measurementByIdLoader.load(measurement.id)
		if (!measurementFound) {
			return null
		}
		return measurementFound.device
	},
	type: async (measurement, args, context) => {
		const { measurementByIdLoader } = context

		const measurementFound = await measurementByIdLoader.load(measurement.id)
		if (!measurementFound) {
			return null
		}
		return measurementFound.type
	},
	environment: async (measurement, args, context) => {
		const { measurementByIdLoader } = context

		const measurementFound = await measurementByIdLoader.load(measurement.id)
		if (!measurementFound) {
			return null
		}
		return measurementFound.environment
	},
	value: async (measurement, args, context) => {
		const { measurementByIdLoader } = context

		const measurementFound = await measurementByIdLoader.load(measurement.id)
		if (!measurementFound) {
			return null
		}
		return measurementFound.value
	},
}

const subscriptionResolvers = {}
const queryResolvers = {}
const mutationResolvers = {}

mutationResolvers.txMeasurement = async (
	obj,
	{ type, environment, value },
	context,
) => {
	const measurement = new Measurement({
		device: context.device,
		type,
		environment,
		value,
	})
	await measurement.save()
	return { id: measurement.id }
}

subscriptionResolvers.newMeasurements = {
	subscribe: withFilter(
		() => pubsub.asyncIterator('newMeasurements'),
		async (payload, args, context) => {
			const { measurementByIdLoader, deviceByIdLoader } = context
			const measurement = await measurementByIdLoader.load(
				payload.newMeasurements.id,
			)
			const device = await deviceByIdLoader.load(measurement.device)

			return device.mac === args.mac
		},
	),
}

module.exports = {
	typeDefs,
	subscriptionResolvers,
	queryResolvers,
	mutationResolvers,
	MeasurementResolver,
}
