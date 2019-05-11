const globalTeardown = async () => {
	await global.__MONGOD__.stop()
}

module.exports = globalTeardown
