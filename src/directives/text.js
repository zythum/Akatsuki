export default {
  displayName: 'text',
  priority: 300,
  stopParseChildElement: true,
  stopParseNextDirective: false,
  routine (value) {
    this.element.innerHTML = ''
    this.element.appendChild(document.createTextNode(value))
  }
}