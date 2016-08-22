var fs = require('fs')
var rollup = require('rollup')
var babel = require('rollup-plugin-babel')
var uglify = require('rollup-plugin-uglify')

rollup.rollup({
  entry: './src/index.js',
  plugins: [ babel() ],
})
.then( bundle => {
  return bundle.write({ 
    format: 'umd',
    moduleName: 'Akatsuki',
    dest: './dist/index.js',
    sourceMap: true
  })
})
.then(() => {
  return rollup.rollup({
    entry: './src/index.js',
    plugins: [ babel(), uglify() ],
  })
})
.then( bundle => {
  return bundle.write({ 
    format: 'umd',
    moduleName: 'Akatsuki',
    dest: './dist/index.min.js',
    sourceMap: true
  })
})
.catch( (e) => console.log(e) )

