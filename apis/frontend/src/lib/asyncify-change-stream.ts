// asyncifyChangeStream takes in a mongoose
// `changeStream` obtained by calling `Model.prototype.watch()`
// and returns an AsyncIterator in which its `.next()`
// element is the `ChangeEvent` object returned by the native
// MongoDB driver (https://docs.mongodb.com/manual/changeStreams/)
import { ChangeStream, ChangeEvent } from 'mongodb'

export default function asyncifyChangeStream(
	changeStream: ChangeStream,
): AsyncIterableIterator<ChangeEvent> {
	const pullQueue: Array<(
		value?: ChangeEvent | PromiseLike<ChangeEvent>,
	) => void> = []
	const pushQueue: Array<ChangeEvent> = []
	let done = false

	const pushValue = (changeEvent: ChangeEvent) => {
		if (pullQueue.length !== 0) {
			const resolve = pullQueue.shift()
			if (!resolve) return
			resolve(changeEvent)
		} else {
			pushQueue.push(changeEvent)
		}
	}

	const pullValue = () => {
		return new Promise<ChangeEvent>(resolve => {
			if (pushQueue.length !== 0) {
				const args = pushQueue.shift()
				resolve(args)
			} else {
				pullQueue.push(resolve)
			}
		})
	}

	changeStream.on('change', changeEvent => {
		pushValue(changeEvent)
	})

	return {
		[Symbol.asyncIterator]() {
			return this
		},
		next: async () => {
			const value = await pullValue()
			return Promise.resolve({
				done,
				value,
			})
		},
		return: async () => {
			done = true
			changeStream.close()
			return Promise.resolve({ done, value: null })
		},
		throw: async error => {
			done = true
			return Promise.reject({
				done,
				value: error,
			})
		},
	}
}
