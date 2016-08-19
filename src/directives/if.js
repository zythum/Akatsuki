import View from '../view'
import {execValueFormatter} from '../formatter'
const placeHolderName = 'akasuki-if-placeholder'

export default {
  displayName: 'if',
  priority: 500,
  stopParseChildElement: true,
  stopParseNextDirective: false,
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

    if (childView) childView.unmout()
    parentNode.insertBefore(element, current)
    parentNode.removeChild(current)    
    if (childView) childView.destroy()
    delete this.childView
    delete this.current
    delete this.parentNode
    delete this.placeHolder
  },
  routine (value) {
    value = execValueFormatter(value, this.formatters)
    let {element, attributeName, view, 
      childView, placeHolder, parentNode, current} = this

    if (!!value) {
      if (! (childView instanceof View) ) {
        childView = this.childView = view.childView(element.cloneNode(true))
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
      if (childView) childView.unmout()
    }
  }
}