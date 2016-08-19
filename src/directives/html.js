import {execValueFormatter} from '../formatter'

export default {
  displayName: 'html',
  priority: 300,
  stopParseChildElement: true,
  stopParseNextDirective: false,
  routine (value) {
    value = execValueFormatter(value, this.formatters)
    this.element.innerHTML = value
  }
}