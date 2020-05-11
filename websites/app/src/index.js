/**
 * ~src/index.js
 * This is the main entry file for Reactjs
 */

import React from 'react'
import ReactDOM from 'react-dom'

import { ApolloClient } from 'apollo-client'
import { createUploadLink } from 'apollo-upload-client'
import { WebSocketLink } from 'apollo-link-ws'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'
import { ApolloProvider } from 'react-apollo'

import { Provider as ReduxProvider, useSelector } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import configureStore from './store/configureStore'
const { store, persistor } = configureStore()

import { BrowserRouter as Router, Route } from 'react-router-dom'

import App from './App'

if (process.env.NODE_ENV === 'production') {
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', () => {
			navigator.serviceWorker
				.register('/sw.js')
				.then(registration => {
					console.log('SW registered: ', registration)
				})
				.catch(registrationError => {
					console.log('SW registration failed: ', registrationError)
				})
		})
	}
}

const Root = () => {
	const accessToken = useSelector(store => store.auth.accessToken)

	return (
		<ApolloProvider client={createApolloClient(accessToken)}>
			<Router>
				<Route path="/:secret?" component={App} />
			</Router>
		</ApolloProvider>
	)
}

ReactDOM.render(
	<PersistGate loading={null} persistor={persistor}>
		<ReduxProvider store={store}>
			<Root />
		</ReduxProvider>
	</PersistGate>,
	document.getElementById('root'),
)

function createApolloClient(accessToken) {
	const uploadLink = createUploadLink({
		uri: process.env.FRONTEND_API_HTTP_ENDPOINT,
		credentials: 'include',
	})

	const authLink = setContext((_, { headers }) => {
		return {
			headers: {
				...headers,
				Authorization: accessToken ? `Bearer ${accessToken}` : '',
			},
		}
	})

	const wsLink = new WebSocketLink({
		uri: process.env.FRONTEND_API_WS_ENDPOINT,
		options: {
			reconnect: true,
			connectionParams: {
				authToken: accessToken ? accessToken : '',
			},
		},
	})

	const link = split(
		// split based on operation type
		({ query }) => {
			const definition = getMainDefinition(query)
			return (
				definition.kind === 'OperationDefinition' &&
				definition.operation === 'subscription'
			)
		},
		wsLink,
		authLink.concat(uploadLink),
	)

	const client = new ApolloClient({
		link,
		cache: new InMemoryCache(),
	})

	return client
}
