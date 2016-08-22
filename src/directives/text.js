export default {
  displayName: 'text',
  priority: 300,
  stopParseChildElement: true,
  stopParseNextDirective: false,
  noValueFormatter: false,
  routine (value) {
    this.element.innerHTML = ''
    this.element.appendChild(document.createTextNode(value))
  }
}