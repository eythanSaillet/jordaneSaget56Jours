const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
	mode: 'development',
	devtool: 'source-map',
	devServer: {
		contentBase: './dist',
		open: true,
		host: '0.0.0.0',
		useLocalIp: true,
	},
	entry: path.resolve(__dirname, '../src/index.js'),
	output: {
		filename: 'bundle.[hash].js',
		path: path.resolve(__dirname, '../dist'),
	},
	plugins: [
		new CleanWebpackPlugin(),
		new MiniCssExtractPlugin(),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../src/index.html'),
		}),
		new CopyWebpackPlugin([{ from: 'static' }]),
	],
	module: {
		rules: [
			{
				test: /\.html$/,
				use: {
					loader: 'html-loader',
					options: {
						attrs: [':src'],
					},
				},
			},
			{
				test: /\.scss$/i,
				use: ['style-loader', 'css-loader', 'sass-loader'],
			},
			{
				test: /\.js$/,
				exclude: /node_modules/, // ?? necéssaire ?? //
				use: ['babel-loader'],
			},
			{
				test: /\.(webm|mp4)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
						},
					},
				],
			},
			{
				test: /\.(png|jpg|gif|svg|jpeg|webm|mp4)$/,
				use: [
					{
						loader: 'file-loader',
						options: { outputPath: 'images/', esModule: false },
					},
				],
			},
			{
				test: /\.(ttf|otf|woff|woff2|eot)$/,
				use: [
					{
						loader: 'file-loader',
						options: { outputPath: 'fonts/' },
					},
				],
			},
		],
	},
}
