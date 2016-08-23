export default {
  displayName: 'class',
  priority: 300,
  stopParseChildElement: false,
  stopParseNextDirective: false,
  noValueFormatter: false,
  noClearAttribute: false,
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
    classNames.forEach((className) => {
      if (className.length === 0) return
      if (!!value) 
        element.classList.add(className)
      else 
        element.classList.remove(className)
    })
  }
}