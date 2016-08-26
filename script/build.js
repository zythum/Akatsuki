var rollup = require('rollup')
var babel = require('rollup-plugin-babel')
var uglify = require('rollup-plugin-uglify')

var logText = 'write /dist/akatsuki.js'
var logTextMin = 'write /dist/akatsuki.min.js'

console.time(logText)
rollup.rollup({
  entry: './src/index.js',
  plugins: [ babel() ],
})
.then( bundle => {
  console.timeEnd(logText)
  return bundle.write({
    format: 'umd',
    moduleName: 'Akatsuki',
    dest: './dist/akatsuki.js',
    sourceMap: true
  })
})
.then(() => {
  console.time(logTextMin)
  return rollup.rollup({
    entry: './src/index.js',
    plugins: [ babel(), uglify() ],
  })
})
.then( bundle => {
  console.timeEnd(logTextMin)
  return bundle.write({
    format: 'umd',
    moduleName: 'Akatsuki',
    dest: './dist/akatsuki.min.js',
    sourceMap: true
  })
})
.catch( e => console.log('got errors:', e) )
console.log('build Akatsuki')
