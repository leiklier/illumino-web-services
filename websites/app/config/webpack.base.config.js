const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const APP_DIR = path.resolve(__dirname, '../src')

module.exports = env => {
	const { PLATFORM, VERSION } = env
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
							PLATFORM === 'production'
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
							PLATFORM === 'production'
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
									PLATFORM === 'production'
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
				new webpack.DefinePlugin({
					'process.env.VERSION': JSON.stringify(env.VERSION),
					'process.env.PLATFORM': JSON.stringify(env.PLATFORM),
				}),
				new CopyWebpackPlugin([{ from: 'src/static' }]),
				new webpack.HashedModuleIdsPlugin(),
			],
			output: {
				filename:
					PLATFORM === 'production'
						? '[name].bundle.[contenthash].js'
						: '[name].bundle.js',
				chunkFilename:
					PLATFORM === 'production'
						? '[name].chunk.bundle.[contenthash].js'
						: '[name].chunk.bundle.js',
				path: path.resolve(__dirname, '..', 'dist'),
				publicPath: '/',
			},
		},
	])
}
