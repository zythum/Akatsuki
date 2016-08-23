export default {
  displayName: 'html',
  priority: 300,
  stopParseChildElement: true,
  stopParseNextDirective: false,
  noValueFormatter: false,
  noClearAttribute: false,
  routine (value) {
    this.element.innerHTML = value
  }
}