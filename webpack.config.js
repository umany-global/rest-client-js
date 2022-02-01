const path    = require('path'),
      Dotenv  = require('dotenv-webpack');

module.exports = {
  mode: 'development',
  entry: __dirname+'/src/bundle.js',
  output: {
    path: __dirname+'/bin',
    filename: 'test.bundle.js',
  },
  plugins:[
    new Dotenv(),
  ]
};