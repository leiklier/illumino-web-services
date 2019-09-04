const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

module.exports = [
	{
		_id: new ObjectId('5cd5b7407a709c508b6201b9'),
		roles: ['user', 'admin'],
		devicesOwning: [new ObjectId('5cd5bb07d5186963186be749')],
		devicesManaging: [],
		email: 'admin@test.com',
		password: '$2a$10$VzEb1M4TMVlEOyHwRjqeKelVXfK7NTfhUOB4HNziwlI1yCE2MypA2',
		firstName: 'Leik',
		lastName: 'Lima-Eriksen',
		__v: 1,
	},
	{
		_id: new ObjectId('5cd5b885badacd5a992b0c9f'),
		roles: ['user'],
		devicesOwning: [new ObjectId('5cd5b96cd5186963186be748')],
		devicesManaging: [],
		email: 'user@test.com',
		password: '$2a$10$iOiqxZbDw3Ekl4pUpfJmouOSnSPaJmRggIWV7sTo0.hUkcTeMcxqC',
		firstName: 'Ola',
		lastName: 'Nordmann',
		__v: 1,
	},
	{
		_id: new ObjectId('5cd5b898badacd5a992b0ca0'),
		roles: ['user', 'root'],
		devicesOwning: [],
		devicesManaging: [],
		email: 'root@test.com',
		password: '$2a$10$kx0sGTJ94Xbk5no.JVrwu.22i5DE9WiKfT4zRJuSwUTarO3sAlRYm',
		firstName: 'ROOT',
		lastName: 'TOOT',
		__v: 0,
	},
]
