// asyncifyChangeStream takes in a mongoose
// `changeStream` obtained by calling `Model.prototype.watch()`
// and returns an AsyncIterator in which its `.next()`
// element is the `changeEvent` object returned by the native
// MongoDB driver (https://docs.mongodb.com/manual/changeStreams/)

export default function asyncifyChangeStream(changeStream) {
	const pullQueue = []
	const pushQueue = []
	let done = false

	const pushValue = async (args) => {
		if (pullQueue.length !== 0) {
			const resolver = pullQueue.shift()
			resolver(...args)
		} else {
			pushQueue.push(args)
		}
	}

	const pullValue = () => {
		return new Promise((resolve) => {
			if (pushQueue.length !== 0) {
				const args = pushQueue.shift()
				resolve(...args)
			} else {
				pullQueue.push(resolve)
			}
		})
	}

	const handler = (...args) => {
		pushValue(args)
	}

	changeStream.on('change', (data) => {
		handler(data)
	})

	return {
		[Symbol.asyncIterator]() {
			return this
		},
		next: async () => {
			if (done) return Promise.resolve({ done, value: undefined })
			const value = await pullValue()

			return {
				done,
				value,
			}
		},
		return: async () => {
			done = true
			changeStream.close()
			return Promise.resolve({ done })
		},
		throw: async (error) => {
			done = true
			return Promise.reject({
				done,
				value: error,
			})
		}
	}
}
