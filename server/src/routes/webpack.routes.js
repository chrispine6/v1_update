const path = require('path');

module.exports = {
  entry: './middleware/searchMiddleware.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/js'),
  },
  mode: 'development', // Add this line to specify the development mode
};
