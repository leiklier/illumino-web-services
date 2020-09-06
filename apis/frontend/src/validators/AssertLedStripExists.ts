import { createMethodDecorator } from 'type-graphql'
import { LedStripArgs } from '../entities/LedStrip'
import { DeviceModel } from '../entities/Device'
import * as error from '../errors'
import { ApolloError } from 'apollo-server-express'

export function AssertLedStripExists(): MethodDecorator {
	return createMethodDecorator(async ({ args }, next) => {
		const { secret, ledStripIndex } = args as LedStripArgs

		const device = await DeviceModel.findOne({ secret })
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}

		if (!device.ledStrips[ledStripIndex]) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}

		return next()
	})
}
