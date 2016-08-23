import { objForeach, getType, objectValueFromPath } from './utils'
import operationsCustom from './operations/custom'
import operationsArray from './operations/array'
import operationsBool from './operations/bool'
import operationsNumber from './operations/number'
import operationsString from './operations/string'

const operations = Object.assign(
  {},
  operationsCustom,
  operationsArray,
  operationsBool,
  operationsNumber,
  operationsString
)

export default class Model {

  constructor (dataObject) {
    this.__model = {}
    this.__events = {}
    if (dataObject) this.update({$set: dataObject})
  }
  
  destroy () {
    delete this.__model
    delete this.__events
  }

  path (path) {
    if (!path || path === '') return this
    return new Path(path, this)
  }

  pathForEach (path, iteratee) {
    let array = this.get(path)
    if ( getType(array) === 'array' ) {
      array.forEach((_, index) => 
        iteratee(this.path(path + '.$' + index), index, this.path(path)))
    } else if (getType(array) === 'object') {
      objForeach((_, key) => 
        iteratee(this.path(path + '.' + key), key, this.path(path)))
    }
  }

  get (path) {
    return objectValueFromPath(this.__model, path, true)
  }

  set (path, value) {
    this.update(pathToObject(path, value))
  }

  update (next) {
    patch(this.__model, next, (parent, key, value, path) => {
      const oldValue = parent[key]
      parent[key] = value
      let oldValueType = getType(oldValue)

      //如果是值属性，并且值相等，那么就不触发变化事件了
      if (
        oldValueType != 'object' && oldValueType != 'array' &&
        value === oldValue
      ) return
      this.emit(path, value)
    }, this, '__model')

  }

  emit (path, value) {
    objForeach(this.__events, (events, _path) => {
      if (path.indexOf(_path) != 0) return
      [].concat(events).forEach( callback => {
        callback(this.get(_path))
      })
    })
  }

  on (path, callback=function(){}) {
    (this.__events[path] = this.__events[path] || []).push(callback)
  }

  off (path, callback) {
    if (!this.__events[path]) return
    const callbacks = this.__events[path]
    for (let idx = 0, len = callbacks.length; idx < len; idx++) {
      if (callbacks[idx] === callback) {
        callbacks.splice(idx, 1)
        break
      }
    }
    if (callbacks.length == 0) delete this.__events[path]
  }
}

//用于 path, pathForEach 的语法糖
class Path {
  constructor (prefix, model) {
    this.prefix = prefix
    this.model = model
  }

  pathForEach (path, iteratee) {
    let array = this.get(path)
    if ( getType(array) === 'array' ) {
      array.forEach((_, index) => 
        iteratee(this.path(path + '.$' + index), index, this.path(path)))
    } else if (getType(array) === 'object') {
      objForeach((_, key) => 
        iteratee(this.path(path + '.' + key), key, this.path(path)))
    }
  }

  path (prefix) {
    return new Path(`${prefix}.${this.prefix}`, this.model)
  }

  get (path) {
    return this.model.get(`${this.prefix}.${path}`)
  }

  set (path, value) {
    this.model.set(`${this.prefix}.${path}`, value)
  }

  update (next) {
    this.model.update(pathToObject(this.prefix, next))
  }

  on (path, callback) {
    this.model.on(`${this.prefix}.${path}`, callback)
  }

  off (path, callback) {
    this.model.off(`${this.prefix}.${path}`, callback)
  }

  emit (path, value) {
    this.model.emit(`${this.prefix}.${path}`, value)
  }
}

function pathToObject (path, last) {
  path = path.split('.')
  let object, current, key
  current = object = {}
  while(key = path.shift()) {
    let match = key.match(/^\$(\d+)$/)
    if (match) {
      key = parseInt(match[1])
      current = current['$update'] = {}
    }
    if (path.length) {
      current = current[key] = {}
    } else {
      current[key] = last
    }
  }
  return object
}

function operationFromNext (next) {
  for (let key in next) if (key.indexOf('$') === 0) return key
  return null
}

function patch (prev, next, callback, prevParent, key, path=[]) {

  const prevType = getType(prev)
  const nextType = getType(next)
  const operation = operationFromNext(next)
  const pathString = path.join('.')
  switch (operation) {
    //正常赋值
    case null:
      if (prevType != nextType) throw "prev next的值类型不一致"      
      if (prevType === 'object') {
        objForeach(next, (_next, key) => {
          patch(prev[key], _next, callback, prev, key, path.concat(key))
        })
      } else {
        callback(prevParent, key, next, pathString)
      }
      break
    case '$set':
      if (prevType != getType(next.$set)) throw "set的数据类型和原先的不一样"
      callback(prevParent, key, next.$set, pathString)
      break
    case '$update':
      if (getType(next.$update) != 'object') throw "update 必须是个对象"
      if (prevType != 'object' && prevType != 'array') throw "prev 必须是个对象或者数组"
      objForeach(next.$update, (_next, key) => {
        let prefix = prevType === 'array' ? '$' : ''
        patch(prev[key], _next, callback, prev, key, path.concat(prefix + key))
      })
      break
    default:
      if (!operations.hasOwnProperty(operation)) throw "operation 没有定义"
      let nextValue = operations[operation](prevParent[key], next[operation])
      callback(prevParent, key, nextValue, pathString)
  }
}