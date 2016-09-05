var apiURL = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22[city]%2C%20ak%22)&format=json'
var speedMap = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117]

function jsonp (url, callback) {
  var count = jsonp.count = jsonp.count || 0
  var handle = 'jsonp' + count++
  var script = document.createElement('script')
  window[handle] = function (arg) {
    delete window[handle]
    document.body.removeChild(script)
    callback(arg)
  }
  document.body.appendChild(script).src = url + '&callback=' +handle
}

function pointToPath (points) {
  var min = Infinity
  var max = 0

  points.forEach(function (point) {
    min = Math.min(min, point[0], point[1])
    max = Math.max(max, point[0], point[1])
  })
  var path = ['', '']
  points.forEach(function (point, index) {
    var prefix = (index == 0 ? 'M' : 'L') + (index * 72 + 36) + ','
    path.forEach(function (_, i) {
      path[i] += prefix + (((1 - (point[i] - min) / (max - min)) * 110) + 20)
    })
  })  
  return path
}

var app = Akatsuki(document.body, {
  viewDidMount: function () {
    this.load()
    this.interval = setInterval(this.load, 60000)
    window.addEventListener('hashchange', this.load)
  },
  viewWillUnmout: function () {
    window.removeEventListener('hashchange', this.load)
    clearInterval(this.interval)
    delete this.interval
  },
  formatters: {
    weather: function (value) { return weathers[value] },
    celsius: function (value) { return ((value - 32) / 1.8).toFixed(0) },
    windBeaufort: function (value) {
      for (var i = 0, len = speedMap.length; i < len; i++) {
        if (value < speedMap[i]) return i
      }
      return i
    }
  },
  computed: {
    mapUrl: ['item.lat', 'item.long', function (la, lo) {
      return 'http://api.map.baidu.com/staticimage?center='+lo+','+la+'&width=1024&height=1024&zoom=10';
    }],
    forecastPath: ['item.forecast', function (forecast) {
      if (forecast) 
        return pointToPath(forecast.map(function (one) { 
          return [parseInt(one.high), parseInt(one.low)] 
        }))
    }]
  },
  methods: {
    load: function () {
      var self = this
      var href = location.href.split('#')
      var city = href[1]
      if (!city) return location.replace(href[0] + '#beijing')
      jsonp(apiURL.replace('[city]', city), function (data) {
        self.update('$set', data.query.results.channel)
      })
    }
  }
})