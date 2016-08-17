import {objectValueFromPath} from './utils'

export default function event (events, view) {
  return events.map(([type, element, path]) => {
    let method = objectValueFromPath(view.__methods, path, '.')
    if (method) method = method.bind(view)
    let instance = {
      destroy () {
        element.removeEventListener(type, method, false)
      }
    }
    element.addEventListener(type, method, false)
    return instance
  })
}