import {execValueFormatter} from '../formatter'

export default {
  displayName: 'class',
  priority: 300,
  stopParseChildElement: false,
  stopParseNextDirective: false,
  bind () {
    this.originClassName = this.element.className
  },
  unbind () {
    this.element.className = this.originClassName
    delete this.originClassName
  },
  routine (value) {
    this.args.join('-').split(/\s+/).forEach((className) => {
      if (className.length === 0) return
      if (!!value) {
        this.element.classList.add(className)
      } else {
        this.element.classList.remove(className)
      }
    })
  }
}