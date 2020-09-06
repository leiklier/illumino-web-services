import { createMethodDecorator } from 'type-graphql'
import { DeviceArgs } from '../entities/Device'
import { DeviceModel } from '../entities/Device'
import * as error from '../errors'
import { ApolloError } from 'apollo-server-express'

export function AssertDeviceExists(): MethodDecorator {
	return createMethodDecorator(async ({ args }, next) => {
		const { secret } = args as DeviceArgs

		const device = await DeviceModel.findOne({ secret })
		if (!device) {
			throw new ApolloError(error.DEVICE_DOES_NOT_EXIST)
		}

		return next()
	})
}
