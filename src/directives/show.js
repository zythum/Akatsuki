import {execValueFormatter} from '../formatter'

export default {
  displayName: 'show',
  priority: 300,
  stopParseChildElement: false,
  stopParseNextDirective: false,
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