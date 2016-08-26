import {getType} from '../utils'
import {directiveHelper} from '../helpers'
/**
 * 更新元素的 attribute 属性，
 * <input type="checkbox" [attr:data-info]="your.model.path"/>
 */
export default directiveHelper({
  displayName: 'attr',
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
})