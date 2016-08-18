import View from '../view'

const placeHolderName = 'akasuki-if-placeholder'

export default {
  displayName: 'if',
  priority: 500,
  stopParseChildElement: true,
  stopParseNextDirective: false,
  bind () {
    let {element} = this
    let parentNode = element.parentNode
    let placeHolder = this.placeHolder =
      document.createComment(placeHolderName)

    parentNode.insertBefore(placeHolder, element)
    parentNode.removeChild(element)
  },
  unbind () {
    let {childView, placeHolderm, element} = this
    let parentNode = placeHolder.parentNode
    if (parentNode) {
      parentNode.insertBefore(element, placeHolder)
      parentNode.removeChild(placeHolder)
    }
    if (childView) childView.destroy()
    delete this.childView
    delete this.placeHolder
  },
  routine (value) {
    let {childView, element, placeHolder, view} = this
    let parentNode = placeHolder.parentNode || element.parentNode
    if (!!value) {
      if (!childView) {
        childView = this.childView = new View(element, {
          model: view.model,
          methods: view.__methods,
          computed: view.__computed
        })
        childView.__rootView = view.__rootView
      }
      if (placeHolder.parentNode) {
        parentNode.insertBefore(element, placeHolder)
        parentNode.removeChild(placeHolder)
      }
      childView.mount()
    } else {
      if (element.parentNode) {
        parentNode.insertBefore(placeHolder, element)
        parentNode.removeChild(element)
      }
      childView.unmout()
    }
  }
}