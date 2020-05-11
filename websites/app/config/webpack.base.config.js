const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const APP_DIR = path.resolve(__dirname, '../src')
const { NODE_ENV } = process.env

module.exports = env => {
	return merge([
		{
			entry: ['@babel/polyfill', APP_DIR],
			module: {
				rules: [
					{
						test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
						use: [
							{
								loader: 'babel-loader',
							},
							{
								loader: '@svgr/webpack',
								options: {
									babel: false,
									icon: true,
								},
							},
						],
					},
					{
						test: /\.js$/,
						exclude: /node_modules/,
						use: {
							loader: 'babel-loader',
						},
					},
					{
						test: /\.css$/,
						use: [
							NODE_ENV === 'production'
								? MiniCssExtractPlugin.loader
								: 'style-loader',
							{
								loader: 'css-loader',
								options: {
									modules: true,
								},
							},
							'postcss-loader',
						],
					},
					{
						test: /\.scss$/,
						use: [
							NODE_ENV === 'production'
								? MiniCssExtractPlugin.loader
								: 'style-loader',
							'css-loader',
							'sass-loader',
							'postcss-loader',
						],
					},
					{
						test: /\.less$/,
						use: [
							{
								loader:
									NODE_ENV === 'production'
										? MiniCssExtractPlugin.loader
										: 'style-loader',
							},
							{
								loader: 'css-loader',
							},
							{
								loader: 'less-loader',
								options: {
									javascriptEnabled: true,
								},
							},
							'postcss-loader',
						],
					},
				],
			},
			plugins: [
				new CleanWebpackPlugin(['dist']),
				new HtmlWebpackPlugin({
					template: './src/index.html',
					filename: './index.html',
				}),
				new webpack.EnvironmentPlugin({
					NODE_ENV: process.env.NODE_ENV,
					PORT: env.PORT,
					FRONTEND_API_HTTP_ENDPOINT: null,
					FRONTEND_API_WS_ENDPOINT: null,
				}),
				new CopyWebpackPlugin([{ from: 'src/static' }]),
				new webpack.HashedModuleIdsPlugin(),
			],
			output: {
				filename:
					NODE_ENV === 'production'
						? '[name].bundle.[contenthash].js'
						: '[name].bundle.js',
				chunkFilename:
					NODE_ENV === 'production'
						? '[name].chunk.bundle.[contenthash].js'
						: '[name].chunk.bundle.js',
				path: path.resolve(__dirname, '..', 'dist'),
				publicPath: '/',
			},
		},
	])
}
