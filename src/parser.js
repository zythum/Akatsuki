/**
 * 获取节点属性是否是对应的标志的开头和结束
 * @param  {string}           attributeName 被判断的字符串
 * @param  {[string, string]} delimiters    标志符数组 比如 ['{', '}'] 那么认为 "{" 开头， "}" 结束，不支持复杂字符
 * @return {string or false}                如果符合 标志的开头和结束 返回内部内容，不然返回fase
 */
export function parseAttributeName (attributeName, delimiters) {
  let [start, end] = delimiters
  if (attributeName.indexOf(start) != 0) return false
  if (attributeName.lastIndexOf(end) != attributeName.length - end.length) return false
  return attributeName.slice(start.length, -end.length)
}

/**
 * 获取文本模版否是对应的标志的开头和结束
 * @param  {string}           template      被判断的字符串
 * @param  {[string, string]} delimiters    标志符数组 比如 ['{', '}'] 那么认为 "{" 开头， "}" 结束，不支持复杂字符
 * @return {[{type, value}...]}             返回判断接口，如果type为text 认为没有符合标志符数组，
 *                                          如果返回 binding 说明符合 value是这段的内容
 */
export function parseTextTemplate (template, delimiters) {
  const length = template.length
  let tokens = []
  let lastIndex = 0

  while (lastIndex < length) {
    let index = template.indexOf(delimiters[0], lastIndex)
    if (index < 0) {
      tokens.push({type: 'text', value: template.slice(lastIndex)})
      break
    } else {
      if (index > 0 && lastIndex < index) {
        tokens.push({type: 'text', value: template.slice(lastIndex, index)})
      }
      lastIndex = index + delimiters[0].length
      index = template.indexOf(delimiters[1], lastIndex)
      if (index < 0) {
        let substring = template.slice(lastIndex) - delimiters[1].length
        let lastToken = tokens[tokens.length - 1]
        if (lastToken && lastToken.type === 'text') {
          lastToken.value += substring
        } else {
          tokens.push({type: 'text', value: substring})
        }
        break
      }
      let value = template.slice(lastIndex, index).trim()
      tokens.push({type: 'binding', value: value})
      lastIndex = index + delimiters[1].length
    }
  }
  return tokens
}

/**
 * 分析 functionName(args1, args2...) 这种格式
 * @param  {string} template       模版字符串
 * @return {functionName, args}    args = [arg1, arg2...]
 */
export function parseFunctionCallString (template) {
  let [functionName, other] = template.split('(')
  let args = []
  if (other) {
    args = other.substring(0, other.indexOf(')')).trim()
    args = args.length === 0 ? [] : args.split(',').map(arg => arg.trim())
  }
  return {functionName: functionName.trim(), args}
}

/**
 * 分析 functionName arg2 arg1... 这种格式
 * @param  {string} template       模版字符串
 * @return {functionName, args}    args = [arg1, arg2...]
 */
function parseFunctionCallString2 (template) {
  let args = template.trim().split(/\s+/)
  let functionName = args.shift()
  return {functionName: functionName, args}
}

/**
 * 分析 "xx.xx.xx | filter1('a') | filter2('b')" 这种格式
 * 或者 "xx.xx.xx | filter1  | filter2 'b'" 这种格式
 * @param  {string} template       模版字符串
 * @return {path, formatters:[]}   formatters 元素是 parseFunctionCallString 的返回值
 */
export function parseDirectiveValue (template) {
  let formatters = template.split('|')
  let path = formatters.shift().trim()
  formatters = formatters.map(formatter => {
    formatter = parseFunctionCallString(formatter)
    if (formatter.args.length === 0) 
      formatter = parseFunctionCallString2(formatter.functionName)
    
    formatter.args = formatter.args.map(arg => {
      let _arg = parseAttributeName(arg, ['\'', '\''])
      if (_arg && _arg.indexOf('\'') === -1) arg = '"' + _arg + '"'
      return JSON.parse(arg)
    })

    return formatter
  })
  return {path, formatters}
}
