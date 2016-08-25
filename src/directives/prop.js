import {directiveHelper} from '../helpers'
/**
 * [prop:propertyName]
 * 更新元素的 property 属性，比如 checked 等
 * `arg` 控制的 property 的name
 * <input type="checkbox" [prop:checked]="your.model.path"/>
 */
export default directiveHelper({
  displayName: 'prop',
  bind () {
    let {element, args} = this
    let propName = this.propName = args

    this.originHasProp = propName in element
    this.originValue = element[propName]
  },
  unbind () {
    let {element, originHasProp, propName} = this
    if (originHasProp)
      element[propName] = this.originValue
    else 
      delete element[propName]

    delete this.originHasProp
    delete this.originValue
    delete this.propName
  },
  routine (value) {    
    let {element, propName} = this
    element[propName] = value
  }
})