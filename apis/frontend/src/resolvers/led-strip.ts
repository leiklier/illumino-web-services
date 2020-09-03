import { Resolver, Args, Query, Arg, Int, Mutation } from 'type-graphql'
import { LedStrip } from '../entities/LedStrip'
import { ExistingDeviceArgs } from './device'
import { DeviceModel, Device } from '../entities/Device'
import { Geometry as GeometryInput } from '../entities/Geometry'
import { Color as ColorInput } from '../entities/Color'
import * as error from '../errors'
import { ApolloError } from 'apollo-server-express'
import { AnimationType } from '../entities/Animation'

@Resolver()
export default class LedStripResolver {
	@Query(() => LedStrip)
	async ledStrip(
		@Args() { secret }: ExistingDeviceArgs,
		@Arg('ledStripIndex', () => Int) ledStripIndex: number,
	): Promise<LedStrip> {
		const device = (await DeviceModel.findOne({ secret }))!
		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}

		return ledStrip
	}

	@Query(() => [LedStrip])
	async ledStrips(@Args() { secret }: ExistingDeviceArgs): Promise<LedStrip[]> {
		const device = (await DeviceModel.findOne({ secret }))!
		return device.ledStrips
	}

	@Mutation(() => Device)
	async setGeometryOnLedStrip(
		@Args() { secret }: ExistingDeviceArgs,
		@Arg('ledStripIndex', () => Int) ledStripIndex: number,
		@Arg('geometry') geometry: GeometryInput,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}

		ledStrip.geometry = geometry
		await device.save()
		return device
	}

	@Mutation(() => Device)
	async setBrightnessOnLedStrip(
		@Args() { secret }: ExistingDeviceArgs,
		@Arg('ledStripIndex', () => Int) ledStripIndex: number,
		@Arg('brightness') brightness: number,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}

		ledStrip.brightness = brightness
		await device.save()
		return device
	}

	@Mutation(() => Device)
	async setColorOnLedStrip(
		@Args() { secret }: ExistingDeviceArgs,
		@Arg('ledStripIndex', () => Int) ledStripIndex: number,
		@Arg('color') color: ColorInput,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}

		ledStrip.color = color
		await device.save()
		return device
	}

	@Mutation(() => Device)
	async setAnimationTypeOnLedStrip(
		@Args() { secret }: ExistingDeviceArgs,
		@Arg('ledStripIndex', () => Int) ledStripIndex: number,
		@Arg('animationType') animationType: AnimationType,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}

		ledStrip.animation.type = animationType
		await device.save()
		return device
	}

	@Mutation(() => Device)
	async setAnimationSpeedOnLedStrip(
		@Args() { secret }: ExistingDeviceArgs,
		@Arg('ledStripIndex', () => Int) ledStripIndex: number,
		@Arg('animationSpeed') animationSpeed: number,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		const ledStrip = device.ledStrips[ledStripIndex]
		if (!ledStrip) {
			throw new ApolloError(error.LED_STRIP_DOES_NOT_EXIST)
		}

		ledStrip.animation.speed = animationSpeed
		await device.save()
		return device
	}
}
