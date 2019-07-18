const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

module.exports = [
	{
		_id: new ObjectId('5cd5b96cd5186963186be748'),
		managers: [],
		lastSeenAt: '2019-05-10T17:48:28.614Z',
		mac: '00:00:00:00:00:00',
		firmware: new ObjectId('5cd5b96cd5186963186be748'), // dummy id
		authKey: '$2a$10$0GlET4dxohBrI.BpRXcLhe6XnUyF3n5ElDy.JMD5/x7mAAxpvBS/u',
		name: 'Ola sin alarm',
		owner: new ObjectId('5cd5b885badacd5a992b0c9f'),
		__v: 0,
	},
	{
		_id: new ObjectId('5cd5bb07d5186963186be749'),
		managers: [],
		lastSeenAt: '2019-05-10T17:55:19.846Z',
		mac: '00:00:00:00:00:01',
		firmware: new ObjectId('5cd5bb07d5186963186be749'), // dummy id
		authKey: '$2a$10$Dhab0AHfZwlrtEIYXbsrPupILiD.sMt.xVVw4/AI9eCXBNwVCPaIO',
		pin: '$2a$10$Lxytns0HJAnm9CLy2GQ0N.82OWt4J7GU6hO2V1zgRBOf6F1w0O9li',
		name: 'Admin´s Alarm',
		__v: 0,
		owner: new ObjectId('5cd5b7407a709c508b6201b9'),
	},
	{
		_id: new ObjectId('5cd5bc310b19fa73f0a26b9e'),
		managers: [],
		lastSeenAt: '2019-05-10T18:00:17.469Z',
		mac: '00:00:00:00:00:02',
		firmware: new ObjectId('5cd5bc310b19fa73f0a26b9e'), // dummy id
		authKey: '$2a$10$xSmpA1bMQPE3dyYxUEl0Ke9GA6LFfeRUXFLqlnfX5D25iCk2fEPY6',
		name: 'Unclaimed Device',
		__v: 0,
	},
]
