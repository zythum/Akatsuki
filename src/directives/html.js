export default {
  displayName: 'html',
  priority: 300,
  stopParseChildElement: true,
  stopParseNextDirective: false,
  routine (value) {
    this.element.innerHTML = value
  }
}