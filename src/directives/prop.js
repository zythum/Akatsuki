import {execValueFormatter} from '../formatter'

export default {
  displayName: 'prop',
  priority: 300,
  stopParseChildElement: false,
  stopParseNextDirective: false,
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
    value = execValueFormatter(value, this.formatters)
    element[propName] = value
  }
}