import { combineReducers, applyMiddleware, compose, createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'localforage'
import { createLogger } from 'redux-logger'
import uiReducer from './ui/reducer'
import authReducer from './auth/reducer'

const rootPersistConfig = {
	key: 'root',
	storage,
	blacklist: ['auth'],
}

const authPersistConfig = {
	key: 'auth',
	storage: storage,
	// Do not persist accessToken since
	// it most probably is invalid upon
	// rehydration:
	blacklist: ['accessToken'],
}

const rootReducer = combineReducers({
	ui: uiReducer,
	auth: persistReducer(authPersistConfig, authReducer),
})

const persistedRootReducer = persistReducer(rootPersistConfig, rootReducer)

const middleware = applyMiddleware(createLogger())

export default function configureStore() {
	const store = createStore(persistedRootReducer, compose(middleware))
	const persistor = persistStore(store)

	return { store, persistor }
}
