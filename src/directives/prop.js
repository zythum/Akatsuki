import {execValueFormatter} from '../formatter'

export default {
  displayName: 'prop',
  priority: 300,
  stopParseChildElement: false,
  stopParseNextDirective: false,
  bind () {
    let {element, args} = this
    let propName = this.propName = args.join('-')

    this.originHasProp = propName in element
    this.originValue = element[propName]
  },
  unbind () {
    if (this.originHasProp)
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
}