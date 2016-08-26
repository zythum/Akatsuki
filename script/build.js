const fs = require('fs')
const zlib = require('zlib')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')
const formateSize = s => (s/1024).toFixed(2)


console.log('> Build Akatsuki <')

let startAt = Date.now()
rollup.rollup({
  entry: './src/index.js',
  plugins: [ babel() ],
})
.then( bundle => {
  return bundle.write({
    format: 'umd',
    moduleName: 'Akatsuki',
    dest: './dist/akatsuki.js',
    sourceMap: true
  })
})
.then(()=> {
  return new Promise(resolve => {
    const time = Date.now() - startAt
    const code = fs.readFileSync('./dist/akatsuki.js')
    console.log(
      'Write akatsuki.js',
      `Time: ${time}ms`,
      `Size: ${formateSize(code.length)}kb`
    )
    startAt = Date.now()
    resolve()
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
    dest: './dist/akatsuki.min.js',
    sourceMap: true
  })
})
.then(()=> {
  return new Promise(resolve => {
    const time = Date.now() - startAt
    const code = fs.readFileSync('./dist/akatsuki.min.js')
    const gzipSize = zlib.gzipSync(code, {level: 9}).length
    console.log(
      'Write akatsuki.min.js',
      `Time: ${time}ms`,
      `Size: ${formateSize(code.length)}kb ${formateSize(gzipSize)}kb(gzip)`
    )
    startAt = Date.now()
    resolve()
  })
})
.catch( e => console.log('got errors:', e) )

