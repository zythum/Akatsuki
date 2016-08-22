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

  get (path) {
    return objectValueFromPath(this.__model, path, true)
  }

  set (path, value) {
    path = path.split('.')
    let next = {}, last, key
    last = next
    while(key = path.shift()) {
      let match = key.match(/^\$(\d)+$/)
      if (match) {
        key = match[1]
        last = last['$update'] = {}
      }
      if (path.length) {
        last = last[key] = {}
      } else {
        last[key] = {$set: value}
      }
    }
    this.update(next)
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