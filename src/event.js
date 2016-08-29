import {noop, objectValueFromPath} from './utils'
import {parseSimpleType_throwError} from './parser'

export default function event (events, view) {
  return events.map(({type, element, name, functionName, args}) => {
    const method = objectValueFromPath(view.__methods, functionName)
    if (!method) return { destroy: noop }

    const attribute = element.getAttributeNode(name)
    let configs = type.split('.')
    type = configs.shift().trim()

    let stop = false
    let prevent = false
    let capture = false

    let keyCodeMap = {}
    let hasKeyCode = false

    configs.forEach( config => {
      config = config.trim()
      switch (config) {
        case 'stop': return stop = true
        case 'prevent': return prevent = true
        case 'capture': return capture = true
        default:
          let code = parseCharCode(config)
          if (code != undefined) {
            hasKeyCode = true
            ;[].concat(code).forEach(code => keyCodeMap[code] = true)
          }
          return
      }
    })

    const listener = event => {
      if (stop) event.stopPropagation()
      if (prevent) event.preventDefault()
      if ( hasKeyCode && keyCodeMap[event.keyCode] != true ) return

      const argMap = {
        $event: event,
        $element: element,
        $value: element.value,
        $data: event && event.detail
      }
      method.apply(view.__rootView, args.map(arg => {
        if (argMap.hasOwnProperty(arg)) return argMap[arg]
        try {
          return parseSimpleType_throwError(arg)
        } catch (e) {
           const [firstPath] = arg.split('.')
          const model = view.__computed.hasOwnProperty(firstPath) ? view.computed : view.model
          return model.get(arg)
        }
      }))
    }

    element.removeAttributeNode(attribute)
    element.addEventListener(type, listener, capture)
    return {
      element: element,
      type: type,
      functionName: functionName,
      method: method,
      args: args,
      destroy () {
        element.removeEventListener(type, listener, capture)
        element.setAttributeNode(attribute)
      }
    }
  })
}

const keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  'delete': [8, 46],
  up: 38,
  left: 37,
  right: 39,
  down: 40
}
/**
 * 获取对应的keyCode
 * @param  {array} keys
 * @return {array} 对应的keyCode
 */
export function parseCharCode (key) {
  let charCode = keyCodes[key]
  if (charCode != undefined) return charCode

  key = key[0]
  charCode = key.toUpperCase().charCodeAt(0)
  //数字
  if (charCode > 47 && charCode < 58) {
    key = parseInt(key, 10)
    return [47 + key, 96 + key]
  }
  //字母
  if (charCode > 64 && charCode < 91) {
    return charCode
  }
  return undefined
}


