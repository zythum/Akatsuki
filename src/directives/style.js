import {directiveHelper} from '../helpers'
import {camelize} from '../utils'

/**
 * [style]
 * 更新元素的 style 属性
 */
export default directiveHelper({
  displayName: 'style',
  bind () {
    this.styleName = camelize(this.args)
    this.originValue = this.element.style[this.styleName]
  },
  unbind () {
    const {styleName, originValue} = this
    this.element.style[styleName] = this.originValue
    delete this.originValue
    delete this.styleName
  },
  routine (value) {
    const {element, styleName} = this
    element.style[styleName] = value
  }
})