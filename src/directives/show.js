import {directiveHelper} from '../helpers'
/**
 * [show]
 * 更新元素的 `style.display` 属性,
 * ⚠️show只是在 `'none'` `''` 之前切换，特殊的css处理会对show有一定影响
 */
export default directiveHelper({
  displayName: 'show',
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
})