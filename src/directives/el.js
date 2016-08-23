import {getType} from '../utils'

export default {
  displayName: 'el',
  priority: 300,
  stopParseChildElement: false,
  stopParseNextDirective: false,
  noValueFormatter: true,
  noClearAttribute: false,
  bind () {
    let {element, args, view} = this
    let elName = this.elName = args
    let els = view.__rootView.els
    if (els[elName]) return 
    els[elName] = element
  },
  unbind () {
    let {element, elName, view} = this
    let els = view.__rootView.els
    if (els[elName] === element) delete els[elName]
    delete this.elName
  },
}