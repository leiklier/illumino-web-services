const mongoose = require('mongoose')

const User = require('../models/user')
const Device = require('../models/device')
const { getTokenByUser, getTokenByDevice } = require('../lib/token')

const createContext = require('./context')

beforeAll(async () => {
	await mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
	})
})

afterAll(async () => {
	await mongoose.disconnect()
})

describe('ApolloServer context', () => {
	it('should create user context when authorized as user', async () => {
		const user = await User.findOne({ email: 'user@test.com' })
		const token = getTokenByUser(user)
		const headers = {
			authorization: `Bearer ${token}`,
		}
		const req = { headers }
		const context = await createContext({ req })

		expect(typeof context.user).toBe('object')
		expect(context.user.id).toBe(user.id)
		expect(context.user.roles).toContain('user')
		expect(context.user.isAdmin).toBeFalsy()
		expect(context.user.isRoot).toBeFalsy()

		expect({
			...context,
			userLoader: undefined,
			deviceLoader: undefined,
		}).toMatchSnapshot()
	})

	it('should create admin context when authorized as admin', async () => {
		const user = await User.findOne({ email: 'admin@test.com' })
		const token = getTokenByUser(user)
		const headers = {
			authorization: `Bearer ${token}`,
		}
		const req = { headers }
		const context = await createContext({ req })

		expect(context.user.roles).toContain('admin')
		expect(context.user.isAdmin).toBeTruthy()
	})

	it('should create device context when authorized as device', async () => {
		const device = await Device.findOne({ mac: '00:00:00:00:00:00' })
		const token = getTokenByDevice(device)
		const headers = {
			authorization: `Bearer ${token}`,
		}
		const req = { headers }
		const context = await createContext({ req })

		expect(typeof context.device).toBe('object')
		expect(context.device.id).toBe(device.id)

		expect({
			...context,
			userLoader: undefined,
			deviceLoader: undefined,
		}).toMatchSnapshot()
	})

	it('should set isDeploying flag when deploy key is provided', async () => {
		const headers = {
			authorization: `Mutual ${process.env.DEPLOY_KEY}`,
		}
		const req = { headers }
		const context = await createContext({ req })
		expect(context.isDeploying).toBeTruthy()
		expect(context.user).toBeFalsy()
		expect(context.device).toBeFalsy()
	})

	it('should not create context without auth header', async () => {
		const headers = {
			authorization: '',
		}
		const req = { headers }
		const context = await createContext({ req })
		expect(context.user).toBeFalsy()
		expect(context.device).toBeFalsy()
		expect(context.isDeploying).toBeFalsy()
		expect(context).toMatchSnapshot()
	})
})
