const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
const User = require('../models/user')
const Device = require('../models/device')

const {
	getTokenByUser,
	getTokenByDevice,
	getUserByToken,
	getDeviceByToken,
} = require('./token')

beforeAll(async () => {
	await mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
	})
})

afterAll(async () => {
	await mongoose.disconnect()
})

describe('Token Library', () => {
	describe('getTokenByUser', () => {
		it('should return a JWT containing userId from a user object', () => {
			const user = {
				id: 123,
			}
			const token = getTokenByUser(user)
			const tokenPayload = jwt.verify(token, process.env.JWT_SECRET)
			expect(typeof token).toBe('string')
			expect(typeof tokenPayload).toBe('object')
			expect(tokenPayload.userId).toBe(user.id)
		})
	})

	describe('getTokenByDevice', () => {
		it('should return a JWT containing deviceId from a device object', () => {
			const device = {
				id: 123,
			}
			const token = getTokenByDevice(device)
			const tokenPayload = jwt.verify(token, process.env.JWT_SECRET)
			expect(typeof token).toBe('string')
			expect(typeof tokenPayload).toBe('object')
			expect(tokenPayload.deviceId).toBe(device.id)
		})
	})

	describe('getUserByToken', () => {
		it('should return a user if tokenPayload stores valid userId', async () => {
			const user = await User.findOne({ email: 'user@test.com' })
			const token = getTokenByUser(user)
			const userReceived = await getUserByToken(token)
			expect(typeof userReceived).toBe('object')
			expect(userReceived.id).toBe(user.id)
		})

		it('should return null if tokenPayload stores invalid userId', async () => {
			const user = {
				id: 'this is an invalid dummy id',
			}
			const token = getTokenByUser(user)
			const userReceived = await getUserByToken(token)
			expect(userReceived).toBeNull()
		})

		it('should return null if no userId in tokenPayload', async () => {
			const token = jwt.sign(
				{
					/* payload intentionally left empty */
				},
				process.env.JWT_SECRET,
				{
					expiresIn: '1h',
				},
			)
			const userReceived = await getUserByToken(token)
			expect(userReceived).toBeNull()
		})
	})

	describe('getDeviceByToken', () => {
		it('should return a device if tokenPayload stores valid deviceId', async () => {
			const device = await Device.findOne({ mac: '00:00:00:00:00:00' })
			const token = getTokenByDevice(device)
			const deviceReceived = await getDeviceByToken(token)
			expect(typeof deviceReceived).toBe('object')
			expect(deviceReceived.id).toBe(device.id)
		})

		it('should return null if tokenPayload stores invalid deviceId', async () => {
			const device = {
				id: 'this is an invalid dummy id',
			}
			const token = getTokenByUser(device)
			const deviceReceived = await getUserByToken(token)
			expect(deviceReceived).toBeNull()
		})

		it('should return null if no deviceId in tokenPayload', async () => {
			const token = jwt.sign(
				{
					/* payload intentionally left empty */
				},
				process.env.JWT_SECRET,
				{
					expiresIn: '1h',
				},
			)
			const deviceReceived = await getDeviceByToken(token)
			expect(deviceReceived).toBeNull()
		})
	})
})
