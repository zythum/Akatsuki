import {execValueFormatter} from '../formatter'
import {getType} from '../utils'

export default {
  displayName: 'el',
  priority: 300,
  stopParseChildElement: false,
  stopParseNextDirective: false,
  bind () {
    let {element, args, view} = this
    let elName = this.elName = args
    let els = view.__rootView.els
    if (els[elName] && els[elName] != element) 
      throw "不要用两个名字相同的节点"
    
    els[elName] = element
  },
  unbind () {
    let {element, elName, view} = this
    let els = view.__rootView.els
    if (els[elName] === element) delete els[elName]
    delete this.elName
  },
}