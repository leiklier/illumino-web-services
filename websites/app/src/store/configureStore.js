import { combineReducers, createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'localforage'
import { composeWithDevTools } from 'redux-devtools-extension'
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


export default function configureStore() {
	const store = createStore(persistedRootReducer, composeWithDevTools())
	const persistor = persistStore(store)

	return { store, persistor }
}
