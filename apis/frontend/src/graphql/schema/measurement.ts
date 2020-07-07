import { gql } from 'apollo-server-express'


export const typeDefs = gql`
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

export const MeasurementResolver = {
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

export const subscriptionResolvers = {}
export const queryResolvers = {}
export const mutationResolvers = {}
