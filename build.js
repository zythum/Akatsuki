var fs = require('fs')
var rollup = require('rollup')
var babel = require('rollup-plugin-babel')
var uglify = require('rollup-plugin-uglify')

rollup.rollup({
  entry: './src/index.js',
  plugins: [ babel() ],
  // plugins: [ babel(), uglify() ],
})
.then( bundle => {
  return bundle.write({ 
    format: 'umd',
    moduleName: 'akatsuki',
    dest: './dist/index.js',
    sourceMap: true
  });
})
.catch( (e) => console.log(e) )