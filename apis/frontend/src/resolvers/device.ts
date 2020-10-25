import { GraphQLResolveInfo } from 'graphql'
import { parseResolveInfo, FieldsByTypeName } from 'graphql-parse-resolve-info'
import {
	Resolver,
	Query,
	Arg,
	FieldResolver,
	Root,
	Args,
	Mutation,
	UseMiddleware,
	Subscription,
} from 'type-graphql'
import {
	Device,
	DeviceModel,
	DeviceEnvironment,
	DeviceArgs,
} from '../entities/Device'
import { UserModel, User } from '../entities/User'
import asyncifyChangeStream from '../lib/asyncify-change-stream'
import { Auth, Relation } from '../middlewares/auth'
import { AssertDeviceExists } from '../validators/AssertDeviceExists'

@Resolver(of => Device)
export default class DeviceResolver {
	@FieldResolver()
	hasPin(@Root() device: Device): boolean {
		return device.pin ? true : false
	}

	@FieldResolver()
	async owner(@Root() device: Device): Promise<User | null> {
		return await UserModel.findOne({ id: device.owner })
	}

	@Query(returns => Device)
	@AssertDeviceExists()
	async device(@Args() { secret }: DeviceArgs): Promise<Device> {
		return (await DeviceModel.findOne({ secret }))!
	}

	@Query(returns => Boolean)
	async secretIsValid(@Args() { secret }: DeviceArgs): Promise<boolean> {
		return (await DeviceModel.findOne({ secret })) ? true : false
	}

	@Mutation(returns => Device)
	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	@AssertDeviceExists()
	async setDeviceName(
		@Args() { secret }: DeviceArgs,
		@Arg('name') name: string,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.name = name
		await device.save()

		return device
	}

	@Mutation(returns => Device)
	@UseMiddleware(Auth({ accepts: [Relation.SELF] }))
	@AssertDeviceExists()
	async setDeviceEnvironment(
		@Args() { secret }: DeviceArgs,
		@Arg('environment') environment: DeviceEnvironment,
	): Promise<Device> {
		const device = (await DeviceModel.findOne({ secret }))!

		device.environment = environment

		await device.save()
		return device
	}

	@Subscription(returns => Device, {
		name: 'device',
		subscribe: (_, { secret }: DeviceArgs, __, info: GraphQLResolveInfo) => {
			const parsedInfo = parseResolveInfo(info) as FieldsByTypeName
			const requestedFields = Object.keys(parsedInfo.fieldsByTypeName.Device)
			const requestedFieldsRegex = new RegExp(
				`^(${requestedFields.join('|')})(\.|$)`,
			)

			// This pipeline does the following:
			// 1. only watch updates of the selected `device`
			// 2. requestedFieldsAreUpdated is true if at least
			//    one of the requested fields from the subscription
			//    has been updated
			// 3. Reject those where requestedFieldsAreUpdated is not
			//    true
			const pipeline = [
				{
					$match: {
						$and: [
							{ operationType: 'update' },
							{ 'fullDocument.secret': secret },
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
									$objectToArray: '$updateDescription.updatedFields',
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
										'$$value',
									],
								},
							},
						},
					},
				},
				{ $match: { requestedFieldsAreUpdated: true } },
			]

			const changeStream = DeviceModel.watch(pipeline, {
				fullDocument: 'updateLookup',
			})

			// Returns new `changeEvent` object
			// each time the `device` has been updated:
			const asyncIterator = asyncifyChangeStream(changeStream)
			return asyncIterator
		},
	})
	async deviceUpdated(
		@Root() payload: any,
		@Args() { secret }: DeviceArgs,
	): Promise<Device> {
		return (await DeviceModel.findOne({ secret }))!
	}
}
