import {noop, getType, dateFormat, objectValueFromPath} from './utils'
import {parseAttributeName} from './parser'
import formattersCommon from './formatters/common'
import formattersNumber from './formatters/number'
import formattersString from './formatters/string'

const formatters = {
  value: Object.assign(
    {}, 
    formattersCommon, 
    formattersNumber, 
    formattersString
  ),
  filter: {},
  sort: {} 
}

export function parseFormatterArgs (formatterArgs, customFormateMap, dependMap) {
  let depends = {}
  formatterArgs = formatterArgs.map(({functionName, args}) => {
    let type 
    if (functionName.indexOf(':') === -1) {
      type = 'value',
      functionName = functionName
    } else {
      [type, functionName] = functionName.split(/\s*\:\s*/)
    }
    
    let formatter = customFormateMap[functionName] || 
      objectValueFromPath(formatters, `${type}.${functionName}`)

    args = args.map(arg => {
      if (dependMap.hasOwnProperty(args)) {
        depends[arg] = true
        return dependMap[arg]
      }
      let _arg = parseAttributeName(arg, ['\'', '\''])
      if (_arg && _arg.indexOf('\'') === -1) arg = '"' + _arg + '"'
      return JSON.parse(arg)
    })
    return {type, formatter, args}
  })
  formatterArgs.depends = depends
  return formatterArgs
}

export function execValueFormatter (value, formatterArgs) {
  return formatterArgs.reduce((value, {type, formatter, args}) => {
    return type === 'value' && getType(formatter) === 'function' ? 
      formatter(value, args) : value
  }, value)
}

//each的filter处理
export function execEachFormatter (value, formatterArgs) {
  let sourceMap = [], 
    indexedArray = value.map((value, index) => ({index, value}))

  formatterArgs.forEach(({type, formatter, args}) => {
    if (getType(formatter) != 'function') return
    switch (type) {
      case 'filter':
        indexedArray = indexedArray.filter((item, index, list) => {
          return formatter(item.value, index, list, args)
        })
        break
      case 'sort':
        indexedArray.sort((item1, item2) => {
          return formatter(item1.value, item2.value, args)
        })
        break
      default: break
    }      
  })
  
  value = indexedArray.map(({index, value}) => {
    sourceMap.push(index)
    return value
  })
  return {value, sourceMap}
}