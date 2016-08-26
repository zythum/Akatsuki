import {getType} from '../utils'
import {directiveHelper} from '../helpers'
/**
 * [el:alias]
 * 获取 elemet 节点, 可以在 `els` 属性上获得他
 * `alias` els 上对应的key名
 * ⚠️ 同名的el只能存在提个，Akastuki设计是抢占式的
 */
export default directiveHelper({
  displayName: 'el',
  noValueFormatter: true,
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
})