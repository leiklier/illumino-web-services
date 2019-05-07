const jwt = require('jsonwebtoken')

const User = require('../models/user')
const Device = require('../models/device')

const getTokenByUser = user => {
	return (token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
		expiresIn: '1h',
	}))
}

const getTokenByDevice = device => {
	return (token = jwt.sign({ deviceId: device.id }, process.env.JWT_SECRET, {
		expiresIn: '7d',
	}))
}

const getUserByToken = async token => {
	if (!token || token === '') {
		return null
	}

	let decodedToken
	try {
		decodedToken = jwt.verify(token, process.env.JWT_SECRET)
	} catch (err) {
		return null
	}
	if (!decodedToken) {
		return null
	}
	const user = await User.findOne({ _id: decodedToken.userId })
		.populate('devicesOwning', '_id mac')
		.populate('devicesManaging', '_id mac')

	return {
		...user.toObject(),
		password: null,
	}
}

const getDeviceByToken = async token => {
	if (!token || token === '') {
		return null
	}

	let decodedToken
	try {
		decodedToken = jwt.verify(token, process.env.JWT_SECRET)
	} catch (err) {
		return null
	}
	if (!decodedToken) {
		return null
	}

	const device = await Device.findOne({ _id: decodedToken.deviceId })
		.populate('owner', '_id email')
		.populate('managers', '_id email')

	return {
		...device.toObject(),
		authKey: null,
		pin: null,
	}
}

module.exports = {
	getTokenByUser,
	getTokenByDevice,
	getUserByToken,
	getDeviceByToken,
}
