import {getType, dateFormat} from './utils'
import formattersCommon from './formatters/common'
import formattersNumber from './formatters/number'
import formattersString from './formatters/string'

const formatters = Object.assign(
  {}, 
  formattersCommon, 
  formattersNumber, 
  formattersString
)

export function execformatter (value, formatterArgs) {
  return formatterArgs.reduce((value, {functionName, args}) => {
    const filter = formatters[functionName]
    return getType(filter) === 'function' ? filter(value, args) : value
  }, value)
}