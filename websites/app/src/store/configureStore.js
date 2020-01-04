import { combineReducers, applyMiddleware, compose, createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'localforage'
import { createLogger } from 'redux-logger'
import ui from './ui/reducer'
import auth from './auth/reducer'

const rootReducer = combineReducers({ ui, auth })

const persistConfig = {
	key: 'root',
	storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const middleware = applyMiddleware(createLogger())

export default function configureStore() {
	const store = createStore(persistedReducer, compose(middleware))
	const persistor = persistStore(store)

	return { store, persistor }
}
