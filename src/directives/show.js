export default {
  displayName: 'show',
  priority: 300,
  stopParseChildElement: false,
  stopParseNextDirective: false,
  noValueFormatter: false,
  noClearAttribute: false,
  bind () {
    this.originDisplay = this.element.style.display
  },
  unbind () {
    this.element.style.display = this.originDisplay
    delete this.originDisplay
  },
  routine (value) {
    this.element.style.display = !!value ? '' : 'none'
  }
}