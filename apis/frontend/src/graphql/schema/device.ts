import { gql, ApolloError } from 'apollo-server-express'
import { parseResolveInfo, FieldsByTypeName } from 'graphql-parse-resolve-info'
import lodash from 'lodash'

import logger from '../../logger'

import asyncifyChangeStream from '../../lib/asyncify-change-stream'
import { expandDotkeyedObject } from '../../lib/object'

import mongoose from 'mongoose'
import Device, { IDevice } from '../../models/device'
import Measurement from '../../models/measurement'

import * as error from '../errors'

export const typeDefs = gql`
	type Device {
		id: ID!
		secret: String! 
		name: String
		owner: User
		managers: [User!]!

		isConnected: Boolean!
		lastSeenAt: DateTime!

		hasPin: Boolean!

		type: DeviceType!

		installedFirmware: Firmware!
			@requiresAuth(acceptsOnly: [SELF, ADMIN, OWNER, MANAGER])

		latestMeasurements(types: [MeasurementType!]): [Measurement!]!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		ledStrips: [LedStrip!]! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		ledStripsAreSynced: Boolean!
			@requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])

		sunset: Sunset! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])
		sunrise: Sunrise! @requiresAuth(acceptsOnly: [SELF, OWNER, MANAGER])
	}

	type DeviceType {
		model: DeviceModel!
		version: String!
	}

	type Sunset {
		startedAt: DateTime
		endingAt: DateTime
	}

	type Sunrise {
		isActive: Boolean!
		startingAt: Time!
	}

	type Time {
		hour: Int!
		minute: Int!
	}

	input TimeInput {
		hour: Int!
		minute: Int!
	}

	enum DeviceModel {
		DEVICE
		ILLUMINODE
		ILLUMINODE_PLUS
	}
`

export const DeviceResolver = {
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
	isConnected: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return false
		}
		return deviceFound.isConnected
	},
	lastSeenAt: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return null
		}
		return deviceFound.lastSeenAt
	},
	hasPin: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return []
		}
		return deviceFound.hasPin
	},
	type: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return []
		}
		return deviceFound.type
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
	ledStripsAreSynced: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return false
		}

		return deviceFound.ledStripsAreSynced
	},
	sunset: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return []
		}

		return deviceFound.sunset
	},
	sunrise: async (device, args, context) => {
		const { deviceByIdLoader } = context

		const deviceFound = await deviceByIdLoader.load(device.id)
		if (!deviceFound) {
			return []
		}

		return deviceFound.sunrise
	},
}


export const subscriptionResolvers = {
	device: {
		subscribe: async (payload, { secret }, context, info) => {
			// Happens when a subscription is initiated:
			const { deviceBySecretLoader } = context
			const parsedInfo = parseResolveInfo(info) as FieldsByTypeName
			const requestedFields = Object.keys(parsedInfo.fieldsByTypeName.Device)
			// 															   			     ,-- either a nested
			//																		    /    field or the whole field
			const requestedFieldsRegex = new RegExp(`^(${requestedFields.join('|')})(\.|$)`)
	
			const device = await deviceBySecretLoader.load(secret)
	
			// This pipeline does the following:
			// 1. only watch updates of the selected `device`
			// 2. requestedFieldsAreUpdated is true if at least
			//    one of the requested fields from the subscription
			//    has been update
			// 3. Reject those where requestedFieldsAreUpdated is not
			//    true
			const pipeline = [
				{
					$match: {
						$and: [
							{ operationType: 'update' },
							{ 'documentKey._id': device._id },
						],
					},
				},
				{
					$addFields: {
						requestedFieldsAreUpdated: {
							$reduce: {
								// Returns array of key-value pairs: [{k: key, v: value}]
								// where k is a key in $updateDescription.updatedFields
								input: {
									$objectToArray: "$updateDescription.updatedFields"
								},
								initialValue: false,
								in: {
									$or: [
										{
											$regexMatch: {
												input: '$$this.k',
												regex: requestedFieldsRegex,
											},
										},
										'$$value'
									],
								},
							},
						},
					},
				},
				{ $match: { requestedFieldsAreUpdated: true } }
			]
	
	
			const changeStream = Device.watch(pipeline)
	
			// Returns new `changeEvent` object
			// each time the `device` has been updated:
			const asyncIterator = asyncifyChangeStream(changeStream)
			return asyncIterator
		},
		resolve: async (payload, args, context) => {
			const { deviceByIdLoader, deviceBySecretLoader } = context
			const deviceId = payload.documentKey._id.toString()
			const { secret } = await deviceByIdLoader.load(deviceId)
			const updatedFields = Object.keys(payload.updateDescription.updatedFields)
	
			const populatedFields = [
				/^installedFirmware/,
				/^owner/,
				/^managers/,
			]
	
			// Updated fields which are populated by documents from
			// different collections:
			const updatedPopulatedFields = updatedFields.filter((updatedField) => {
				for (const populatedField of populatedFields) {
					if (populatedField.test(updatedField)) {
						// the current updatedField is a populated field
						return true
					}
				}
				return false
			})
	
			if (updatedPopulatedFields.length !== 0) {
	
				// We cannot hot patch populated fields, so
				// flush the dataloader:
				deviceByIdLoader.clear(deviceId)
				deviceBySecretLoader.clear(secret)
	
				const device = await deviceBySecretLoader.load(secret)
				return device
			}
	
			// The updated fields are not populated,
			// and so we can just merge in the changes
			// with the version stored in the dataloaders:
			const deviceDiff = expandDotkeyedObject(payload.updateDescription.updatedFields)
			const cachedDevice = await deviceByIdLoader.load(deviceId)
			const updatedDevice = lodash.merge(cachedDevice, deviceDiff)
	
			deviceByIdLoader.clear(deviceId).prime(deviceId, updatedDevice)
			deviceBySecretLoader.clear(secret).prime(secret, updatedDevice)
	
	
			return updatedDevice
		}
	},
}


export const queryResolvers = {
	device: async (obj, { secret }, context) => {
		const { deviceBySecretLoader } = context
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			return null
		}
	
		return { id: device.id }
	},

	devices: async (obj, { secrets }, context) => {
		const devices = await Device.find({ secret: { $in: secrets } })
		return devices
	},

	secretIsValid: async (obj, { secret }, context) => {
		const deviceIsFound = await Device.findOne({ secret })
		return Boolean(deviceIsFound)
	},
}

export const mutationResolvers = {
	claimDevice:  async (obj, { secret }, context) => {
		const { userByIdLoader, deviceBySecretLoader, clientIp } = context
	
		const ownerId = context.user.id
	
		const device = await deviceBySecretLoader.load(secret)
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
		const session = await mongoose.startSession()
		session.startTransaction()
		try {
			await owner.save()
			await device.save()
	
			logger.info(`Device with secret ${device.secret} authorized`, {
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
	},

	setDevicePin: async (obj, { secret, pin }, context) => {
		const { deviceBySecretLoader } = context
	
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		device.pin = pin
	
		await device.save()
		return { id: device.id }
	},

	setDeviceName: async (obj, { secret, name }, context) => {
		const { deviceBySecretLoader } = context
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		device.name = name
		await device.save()
	
		return { id: device.id }
	},

	startSunset: async (
		obj,
		{ secret, startedAt, endingAt },
		context,
	) => {
		const { deviceBySecretLoader } = context
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		device.sunset = { startedAt, endingAt }
		await device.save()
	
		return device
	},
	stopSunset: async (obj, { secret }, context) => {
		const { deviceBySecretLoader } = context
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		device.sunset = { startedAt: null, endingAt: null }
		await device.save()
	
		return device
	},

	updateSunrise: async (obj, { secret, startingAt, isActive }, context) => {
		const { deviceBySecretLoader } = context
		const device = await deviceBySecretLoader.load(secret)
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}
	
		device.sunrise = {
			...device.sunrise,
			isActive,
			startingAt
		}
	
		await device.save()
		return device
	},


}
