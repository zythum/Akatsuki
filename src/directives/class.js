import {execValueFormatter} from '../formatter'

export default {
  displayName: 'class',
  priority: 300,
  stopParseChildElement: false,
  stopParseNextDirective: false,
  bind () {
    this.classNames = this.args.split(/\s+/)
    this.originClassName = this.element.className
  },
  unbind () {
    this.element.className = this.originClassName
    delete this.originClassName
    delete this.classNames
  },
  routine (value) {
    let {element, classNames} = this
    value = execValueFormatter(value, this.formatters)
    classNames.forEach((className) => {
      if (className.length === 0) return
      if (!!value) 
        element.classList.add(className)
      else 
        element.classList.remove(className)
    })
  }
}