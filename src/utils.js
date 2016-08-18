//获取对象类型
let class2type = {}
let _toString = class2type.toString
;'Boolean Number String Function Array Date RegExp Object Error'.split(' ')
  .forEach( item => class2type[`[object ${item}]`] = item.toLowerCase() )

export function getType (object) {
  if (object === null) return object + ''
  let type = typeof object
  return type === 'object' || type === "function" ?
    class2type[_toString.call(object)] || 'object' : type
}

export function objForeach (obj, callback) {
  let result = {}
  for (let key in obj)
    if (obj.hasOwnProperty(key))
      result[key] = callback(obj[key], key)
  return result
}

function walkChild (element, callback) {
  if (element) {
    walkChild(element.nextSibling, callback)
    if (callback(element) != false)
      walkChild(element.firstChild, callback)
  }
}
export function walk (element, callback) {
    if (callback(element) != false) walkChild(element.firstChild, callback)
}

export function objectValueFromPath (obj, path, spliter, parseNumber) {
  path = path.split(spliter)
  let key
  while (key = path.shift()) {
    if (parseNumber) {
      let match = key.match(/^\$(\d+)$/)
      if (match) key = match[1]
    }
    if (obj.hasOwnProperty(key)) obj = obj[key]
    else return
  }
  return obj
}