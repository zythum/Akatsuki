import View from '../view'
import {execEachFormatter} from '../formatter'
import {getType} from '../utils'

const startPlaceHolderName = 'akasuki-each-start-placeholder'
const endPlaceHolderName = 'akasuki-each-end-placeholder'

function shiftOne (array) {
  if (array.length === 0) return undefined
  let one = array.shift()
  return one === undefined ? shiftOne(array) : one
}

export default {
  displayName: 'each',
  priority: 600,
  stopParseChildElement: true,
  stopParseNextDirective: true,
  bind () {
    let { element } = this
    let childViews = this.childViews = []
    let parentNode = this.parentNode = 
      element.parentNode
    let startPlaceHolder = this.startPlaceHolder = 
      document.createComment(startPlaceHolderName)
    let endPlaceHolder = this.endPlaceHolder = 
      document.createComment(endPlaceHolderName)    
    parentNode.insertBefore(startPlaceHolder, element)
    parentNode.insertBefore(endPlaceHolder, element)
    parentNode.removeChild(element)

  },
  unbind () {
    let {element, childViews, parentNode, 
      startPlaceHolder, endPlaceHolder} = this
    childViews.forEach(childView => {
      childView.unmout()
      parentNode.removeChild(childView.__rootElement)
      childView.destroy()
    })
    parentNode.insertBefore(element, startPlaceHolder)
    parentNode.removeChild(startPlaceHolder)
    parentNode.removeChild(endPlaceHolder)
    delete this.childViews
    delete this.parentNode
    delete this.startPlaceHolder
    delete this.endPlaceHolder
  },
  routine (value) {
    
    let sourceMap
    if (this.formatters.length) {
      let result = execEachFormatter(value, this.formatters)
      sourceMap = result.sourceMap
      value = result.sourceMap
    }

    let {element, attributeName, path, view, 
      childViews, parentNode, endPlaceHolder} = this
    
    let itemKey = this.args
    let keys = {}

    value.forEach(item => {
      if (getType(item) === 'object' && 'key' in item) 
        keys[item.key] = null 
    })

    childViews.forEach((childView, index, list) => {
      childView.unmout()
      if (!childView.hasOwnProperty('key')) return
      if (keys.hasOwnProperty(childView.key)) {
        keys[childView.key] = childView
      } else {
        childView.destroy()
        parentNode.removeChild(childView.element)
      }
      list[index] = undefined
    })

    let nextChildViews = []
    value.forEach((item, index) => {
      let key = item.key
      let childView = keys[key] instanceof View ? keys[key] : shiftOne(childViews)
      if (!childView) {
        childView = view.childView(element.cloneNode(true))
        childView.__rootElement.removeAttribute(attributeName)
      }
      childView.__computed = Object.assign({}, view.__computed, {
        [itemKey]: [path + '.$' + (sourceMap ? sourceMap[index] : index), (item) => item],
        '$index': [()=> index],
        '$length': [() => value.length]
      })
      parentNode.insertBefore(childView.__rootElement, endPlaceHolder)
      childView.mount()
      nextChildViews.push(childView)
    })

    childViews.forEach(childView => { 
      if (childView) {
        parentNode.removeChild(childView.__rootElement)
        childView.destroy()
      } 
    })

    this.childViews = nextChildViews
  }
}