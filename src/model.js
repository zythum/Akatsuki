import {
  objForeach,
  getType,
  objectValueFromPath,
  deepCopy,
  pathToObject,
  assert,
} from './utils'
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
    dataObject = deepCopy(dataObject, (key) => {
      const match = key.match(/(\s+|\(|\)|\[|\]|\.|\,\{|\})/)
      assert(!!match,
        'model name %s is not allowed, model name can not have " "(/\s/) character.', match && match[1])
      assert(key.indexOf('$') === 0,
        'model name %s is not allowed, model name can not start with "$".', key)
    })
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

  //反hook path的 each
  each (iteratee) { return this.path().each(iteratee) }

  /**
   * 从path获取对象
   * @param  {path} path
   * @return {any}
   */
  get (path) {
    return deepCopy(objectValueFromPath(this.__model, path, true))
  }

  /**
   * 从path设置对象值
   * @param {path} path
   * @param {any} value
   */
  set (path, value) {
    this.update(pathToObject(path, value))
  }

  /**
   * update对象
   * @param  {object} next
   */
  update (next) {
    //语法糖 支持 update('$push', 1) 这种写法
    if (getType(next) === 'string') next = {[next]: arguments[1]}

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

  //事件处理函数。
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

//用于 path, each 的语法糖
class Path {
  constructor (prefix, model) {
    this.prefix = prefix
    this.model = model
  }

  //
  relative (path) {
    var _path = []
    if (this.prefix) _path.push(this.prefix)
    if (path) _path.push(path)
    return _path.join('.')
  }

  path (prefix) {
    return new Path(this.relative(prefix), this.model)
  }

  each (iteratee) {
    let object = this.get()
    switch (getType(object)) {
      case 'array':
        return object.map((_, index) =>
          iteratee(this.path('$' + index), index, this))
      case 'object':
        return objForeach(object, (_, key) =>
          iteratee(this.path('$' + index), key, this))
      default: assert(true,
        `${object} is not an array or object, "each" mothed is not allowed with ${object}.`)
    }
  }

  // hook model
  get (path) { return this.model.get(this.relative(path)) }
  set (path, value) { this.model.set(this.relative(path), value) }
  update (next) {
    //语法糖 支持 update('$push', 1) 这种写法
    if (getType(next) === 'string') next = {[next]: arguments[1]}
    this.model.update(pathToObject(this.prefix, next))
  }
  on (path, callback) { this.model.on(this.relative(path), callback) }
  off (path, callback) { this.model.off(this.relative(path), callback) }
  emit (path, value) { this.model.emit(this.relative(path), value) }
}

/**
 * 寻找两个数据对象的差异
 * @param  {object or array}      prev       源数据对象
 * @param  {object or array}      next       新数据对象
 * @param  {Function}             callback   差异的回调函数
 * @param  {object or array}      prevParent 源数据对象的父级
 * @param  {string}               key        源数据对象对应父级的key
 * @param  {array}                path       源数据对象的顶级的 path
 * @return
 */
export function patch (prev, next, callback, prevParent, key, path=[]) {

  const prevType = getType(prev)
  const nextType = getType(next)
  const operation = operationFromNext(next)
  const pathString = path.join('.')
  switch (operation) {
    //正常赋值
    case null:
      assert(prevType != nextType,
        `new data %s's type is not same as prev data %s.`, next, prev)
      if (prevType === 'object') {
        objForeach(next, (_next, key) =>
          patch(prev[key], _next, callback, prev, key, path.concat(key)))
      } else {
        callback(prevParent, key, next, pathString)
      }
      break
    case '$set':
      callback(prevParent, key, next.$set, pathString)
      break
    case '$update':
      assert(getType(next.$update) != 'object',
        `%s is not allowed, "$update"'s param must to be an Object.`, next.$update)
      assert(prevType != 'object' && prevType != 'array',
        `"$update" only can operation at Object or Array, but %s is a %s.`, prev, prevType)
      objForeach(next.$update, (_next, key) => {
        let prefix = prevType === 'array' ? '$' : ''
        patch(prev[key], _next, callback, prev, key, path.concat(prefix + key))
      })
      break
    default:
      assert(!operations.hasOwnProperty(operation), `operation %s is not exists.`, operation)
      let nextValue = operations[operation](prevParent[key], next[operation])
      callback(prevParent, key, nextValue, pathString)
  }
}

function operationFromNext (next) {
  for (let key in next) if (key.indexOf('$') === 0) return key
  return null
}