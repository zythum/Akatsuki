'use strict';

const fs = require('fs')
const zlib = require('zlib')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')

function formateSize (s) {
  return (s/1024).toFixed(2)
}

function padLeft (str, number = 0) {
  if (str.length < number) return Array(number - str.length).join(' ') + str
  return str
}

function padRight (str, number = 0) {
  if (str.length < number) return str + Array(number - str.length).join(' ')
  return str
}

function blue (str) {  
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}


console.log('> Build Akatsuki')

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
    const time = Date.now() - startAt + ''
    const code = fs.readFileSync('./dist/akatsuki.js')
    console.log(
      blue(padRight('akatsuki.js', 16)),
      `Time: ${padLeft(time, 5)}ms`,
      `Size: ${padLeft(formateSize(code.length), 6)}kb`
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
    const time = Date.now() - startAt  + ''
    const code = fs.readFileSync('./dist/akatsuki.min.js')
    const gzipSize = zlib.gzipSync(code, {level: 9}).length
    console.log(
      blue(padRight('akatsuki.min.js', 16)),
      `Time: ${padLeft(time, 5)}ms`,
      `Size: ${padLeft(formateSize(code.length), 6)}kb ${formateSize(gzipSize)}kb(gzip)`,
      '\n'
    )
    resolve()
  })
})
.catch( e => console.log('got errors:', e) )