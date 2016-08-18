import {parseTextTemplate, parseAttributeName} from './parser'
import {objForeach, getType, walk} from './utils'
import directive from './directive'
import Model from './model'
import event from './event'

const defaultTextDelimiters = ['${', '}']
const defaultTirectiveAttributeDelimiters = ['[', ']']
const defaultTventAttributeDelimiters = ['(', ')']

export default class View {
  constructor (element, {
    model = {},
    computed = {},
    methods = {},
  }) {
    this.model = model

    this.__rootView = this
    this.__rootElement = element    
    this.__methods = methods
    this.__computed = computed
    this.__computedModel = null

    this.__binding = []
    this.__textDelimiters = defaultTextDelimiters
    this.__directiveAttributeDelimiters = defaultTirectiveAttributeDelimiters
    this.__eventAttributeDelimiters = defaultTventAttributeDelimiters
    this.mounted = false
    this.destroyed = false
  }
  destroy () {
    this.unmout()
    delete this.model
    delete this.__rootView    
    delete this.__rootElement
    delete this.__methods
    delete this.__binding
  }
  unmout () {
    if (!this.mounted) return
    
    this.__binding.forEach(binding => binding.destroy())
    this.__binding = []

    this.__computedModel.destroy()
    this.__computedModel = null

    this.mounted = false
  }

  mount () {
    if (this.mounted) return

    const computedModel = this.__computedModel = new Model({})
    computedModel.linsteners = []
    objForeach(this.__computed, (computed, name) => {
      const modelPaths = [].concat(computed)
      const _computedFunction = modelPaths.pop()

      if (getType(_computedFunction) === 'function') {
        const routine = () => {
          return _computedFunction.apply(this, modelPaths.map(path => {
            return this.model.get(path)
          }))
        }        
        const linstener = () => computedModel.set(name, routine())
        computedModel.__model[name] = routine()
        modelPaths.forEach(modelPath => this.model.on(modelPaths, linstener))
      }
    })

    walk(this.__rootElement.firstChild, element => {
      let returnValue
      switch (element.nodeType) {
        case 3: //text节点
          let tokens = parseTextTemplate(element.nodeValue, this.__textDelimiters)
          tokens.forEach( token => {
            let textNode = document.createTextNode(token.value)
            element.parentNode.insertBefore(textNode, element)
            if (token.type === 'binding')
              this.__binding.push(
                directive.text(textNode, token.value, this))
          })
          element.parentNode.removeChild(element)
          break

        case 1: //element节点
          let attributes = element.attributes
          let directives = []
          let events = []
          for (let idx = 0, len = attributes.length; idx < len; idx++) {
            let {name, value} = attributes[idx]
            let type
            //判断为数据绑定
            if ( type = parseAttributeName(name, 
              this.__directiveAttributeDelimiters) ) {
              let args = type.split('-')
              type = args.shift()
              if ( directive.hasType(type) )
                directives.push([type, element, value, args])
            }

            //判断为事件绑定            
            else if ( type = parseAttributeName(name, 
              this.__eventAttributeDelimiters) ) {
              type.split('&').forEach(type => events.push([type, element, value]))
            }
          }
          if (directives.length) {
            let {instances, needBreak} = directive(directives, this)
            instances.forEach(ins => this.__binding.push(ins))
            returnValue = !needBreak
          }
          if (events.length) {
            let evtHandler = event(events, this)
            evtHandler.forEach(ins => this.__binding.push(ins))
          }
          break

        default: break
      }
      return returnValue
    })
    this.mounted = true
  }
}
