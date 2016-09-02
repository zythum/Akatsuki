import View, {createChildView} from '../view'
import {directiveHelper} from '../helpers'

const placeHolderName = 'akasuki-if-placeholder'
/**
 * [if]
 * 根据表达式的值的真假渲染element。在切换时元素及它的数据绑定被销毁并重建
 * <div [if]="your.model.path"> 暁よ。一人前のレディーとして扱ってよね！</div>
 */
export default directiveHelper({
  displayName: 'if',
  priority: 500,
  stopParseChildElement: true,
  stopParseNextDirective: true,
  noClearAttribute: true,
  bind () {
    let {element} = this
    let parentNode = this.parentNode = element.parentNode
    let placeHolder = this.placeHolder = this.current =
      document.createComment(placeHolderName)

    parentNode.insertBefore(placeHolder, element)
    parentNode.removeChild(element)
  },
  unbind () {
    let {childView, element, parentNode, current} = this

    if (childView) childView.unmount()
    parentNode.insertBefore(element, current)
    parentNode.removeChild(current)
    if (childView) childView.destroy()
    delete this.childView
    delete this.current
    delete this.parentNode
    delete this.placeHolder
  },
  routine (value) {
    let {element, attributeName, view,
      childView, placeHolder, parentNode, current} = this

    if (!!value) {
      if (! (childView instanceof View) ) {
        childView = this.childView = createChildView(view, element.cloneNode(true))
        childView.__rootElement.removeAttribute(attributeName)
      }
      if (current === placeHolder) {
        parentNode.insertBefore(childView.__rootElement, current)
        parentNode.removeChild(current)
        this.current = childView.__rootElement
      }
      childView.mount()
    } else {
      if (current != placeHolder) {
        parentNode.insertBefore(placeHolder, current)
        parentNode.removeChild(current)
        this.current = placeHolder
      }
      if (childView) childView.unmount()
    }
  }
})