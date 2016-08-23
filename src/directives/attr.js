import {getType} from '../utils'

export default {
  displayName: 'attr',
  priority: 300,
  stopParseChildElement: false,
  stopParseNextDirective: false,
  noValueFormatter: false,
  noClearAttribute: false,
  bind () {
    let {element, args} = this
    let attrName = this.attrName = args
    this.originValue = element.getAttribute(attrName)
  },
  unbind () {
    let {element, attrName, originValue} = this
    
    if (originValue) 
      element.setAttribute(attrName, originValue)
    else
      element.removeAttribute(attrName)

    delete this.attrName
    delete this.originValue
  },
  routine (value) {
    let {element, attrName} = this
    if (getType(value) === 'boolean') {
      if (value)
        element.setAttribute(attrName, attrName)
      else 
        element.removeAttribute(attrName)
    } else {
      element.setAttribute(attrName, value)
    }
  }
}