import {execValueFormatter} from '../formatter'

export default {
  displayName: 'text',
  priority: 300,
  stopParseChildElement: true,
  stopParseNextDirective: false,
  routine (value) {
    value = execValueFormatter(value, this.formatters)
    this.element.innerHTML = ''
    this.element.appendChild(document.createTextNode(value))
  }
}