// Karma configuration
// Generated on Thu Aug 25 2016 23:14:50 GMT+0800 (CST)
module.exports = config => {
  config.set({
    basePath: '../',
    frameworks: ['mocha', 'chai'],
    files: [
      'dist/akatsuki.js',
      'test/**/*.spec.js'
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.js': ['rollup']
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity
  })
}