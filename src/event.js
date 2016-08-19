import {noop, objectValueFromPath} from './utils'

export default function event (events, view) {
  return events.map(({type, element, functionName, args}) => {
    let method = objectValueFromPath(view.__methods, functionName, '.')
    if (!method) return { destroy: noop }
    
    const listener = event => {
      const argMap = {
        $event: event,
        $element: element,
        $value: element.value,
        $index: view.__computedModel.get('$index'),
        $length: view.__computedModel.get('$length'),
      }
      method.apply(view.__rootView, args.map(type => argMap[type]))
    }
    
    element.addEventListener(type, listener, false)
    return {
      element: element,
      type: type,
      functionName: functionName,
      method: method,
      args: args,
      destroy () {
        element.removeEventListener(type, listener, false)
      }
    }
  })
}