const jwt = require('jsonwebtoken')

const User = require('../../src/models/user')
const Device = require('../../src/models/device')

const {
	getTokenByUser,
	getTokenByDevice,
	getUserByToken,
	getDeviceByToken,
} = require('../../src/helpers/token')

describe('Auth library', () => {
	describe('getTokenByUser', () => {
		it('should return a JWT containing userId from a user object', () => {
			const user = {
				id: 123,
			}
			const token = getTokenByUser(user)
			const tokenPayload = jwt.verify(token, process.env.JWT_SECRET)
			expect(token).to.be.a('string')
			expect(tokenPayload).to.be.a('Object')
			expect(tokenPayload.userId).to.equal(user.id)
		})
	})

	describe('getTokenByDevice', () => {
		it('should return a JWT containing deviceId from a device object', () => {
			const device = {
				id: 123,
			}
			const token = getTokenByDevice(device)
			const tokenPayload = jwt.verify(token, process.env.JWT_SECRET)
			expect(token).to.be.a('string')
			expect(tokenPayload).to.be.a('Object')
			expect(tokenPayload.deviceId).to.equal(device.id)
		})
	})

	describe('getUserByToken', () => {
		before(async () => {
			console.log('hey')
			await db.create()
			await db.populate(['users'])
		})

		after(async () => {
			await db.destroy()
		})

		it('should return a user if tokenPayload stores valid userId', async () => {
			const user = await User.findOne({ email: 'user@test.com' })
			const token = getTokenByUser(user)
			const userReceived = await getUserByToken(token)
			expect(userReceived).to.be.a('Object')
			expect(userReceived.id).to.be.equal(user.id)
		})

		it('should return null if tokenPayload stores invalid userId', async () => {
			const user = {
				id: 'this is an invalid dummy id',
			}
			const token = getTokenByUser(user)
			const userReceived = await getUserByToken(token)
			expect(userReceived).to.be.a('null')
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
			expect(userReceived).to.be.a('null')
		})
	})

	describe('getDeviceByToken', () => {
		before(async () => {
			await db.create()
			await db.populate(['devices'])
		})

		after(async () => {
			await db.destroy()
		})

		it('should return a device if tokenPayload stores valid deviceId', async () => {
			const device = await Device.findOne({ mac: '00:00:00:00:00:00' })
			const token = getTokenByDevice(device)
			const deviceReceived = await getDeviceByToken(token)
			expect(deviceReceived).to.be.a('Object')
			expect(deviceReceived.id).to.be.equal(device.id)
		})

		it('should return null if tokenPayload stores invalid deviceId', async () => {
			const device = {
				id: 'this is an invalid dummy id',
			}
			const token = getTokenByUser(device)
			const deviceReceived = await getUserByToken(token)
			expect(deviceReceived).to.be.a('null')
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
			expect(deviceReceived).to.be.a('null')
		})
	})
})
