const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')

// Configs
const baseConfig = require('./webpack.base.config')

const APP_DIR = path.resolve(__dirname, '../src')

const devConfig = env => {
	return {
		devServer: {
			contentBase: APP_DIR,
			hot: true,
			inline: true,
			historyApiFallback: true,
			compress: true,
			host: '0.0.0.0',
			port: env.PORT || 3000,
		},
		plugins: [new webpack.HotModuleReplacementPlugin()],
	}
}

module.exports = env => {
	return merge(baseConfig(env), devConfig(env))
}
