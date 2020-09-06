import {
	Resolver,
	Args,
	Query,
	Arg,
	Mutation,
	UseMiddleware,
} from 'type-graphql'
import { LedStrip, LedStripArgs } from '../entities/LedStrip'
import { DeviceModel, Device, DeviceArgs } from '../entities/Device'
import { Geometry as GeometryInput } from '../entities/Geometry'
import { Color as ColorInput } from '../entities/Color'
import { AnimationType } from '../entities/Animation'
import { AssertLedStripExists } from '../validators/AssertLedStripExists'
import { AssertDeviceExists } from '../validators/AssertDeviceExists'
import { Auth, Relation } from '../middlewares/auth'

@Resolver()
export default class LedStripResolver {
	@Query(returns => LedStrip)
	@AssertLedStripExists()
	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	async ledStrip(
		@Args() { secret, ledStripIndex }: LedStripArgs,
	): Promise<LedStrip> {
		const device = (await DeviceModel.findOne({ secret }))!
		return device.ledStrips[ledStripIndex]
	}

	@Query(returns => [LedStrip])
	@AssertDeviceExists()
	async ledStrips(@Args() { secret }: DeviceArgs): Promise<LedStrip[]> {
		const device = (await DeviceModel.findOne({ secret }))!
		return device.ledStrips
	}

	@Mutation(returns => Device)
	@AssertLedStripExists()
	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	async setGeometryOnLedStrip(
		@Args() { secret, ledStripIndex }: LedStripArgs,
		@Arg('geometry') geometry: GeometryInput,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.ledStrips[ledStripIndex].geometry = geometry

		await device.save()
		return device
	}

	@Mutation(returns => Device)
	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	@AssertLedStripExists()
	async setBrightnessOnLedStrip(
		@Args() { secret, ledStripIndex }: LedStripArgs,
		@Arg('brightness') brightness: number,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.ledStrips[ledStripIndex].brightness = brightness

		await device.save()
		return device
	}

	@Mutation(returns => Device)
	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	@AssertLedStripExists()
	async setColorOnLedStrip(
		@Args() { secret, ledStripIndex }: LedStripArgs,
		@Arg('color') color: ColorInput,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.ledStrips[ledStripIndex].color = color

		await device.save()
		return device
	}

	@Mutation(returns => Device)
	@AssertLedStripExists()
	async setAnimationTypeOnLedStrip(
		@Args() { secret, ledStripIndex }: LedStripArgs,
		@Arg('animationType') animationType: AnimationType,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.ledStrips[ledStripIndex].animation.type = animationType

		await device.save()
		return device
	}

	@Mutation(returns => Device)
	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	@AssertLedStripExists()
	async setAnimationSpeedOnLedStrip(
		@Args() { secret, ledStripIndex }: LedStripArgs,
		@Arg('animationSpeed') animationSpeed: number,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.ledStrips[ledStripIndex].animation.speed = animationSpeed

		await device.save()
		return device
	}
}
