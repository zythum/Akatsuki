import {  
  parseTextTemplate, 
  parseAttributeName, 
  parseDirectiveValue, 
  parseFunctionCallString
} from './parser'

import {noop, objForeach, getType, walk} from './utils'
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
    viewWillMount = noop,
    viewDidMount = noop,
    viewWillUnmount = noop,
    viewDidUmmount = noop,
  }) {
    this.model = model    
    this.__rootView = this
    this.__rootElement = element    
    this.__methods = methods
    this.__computed = computed
    this.__computedModel = null

    this.viewWillMount = viewWillMount
    this.viewDidMount = viewDidMount
    this.viewWillUnmount = viewWillUnmount
    this.viewDidUmmount = viewDidUmmount

    this.__binding = []
    this.__textDelimiters = defaultTextDelimiters
    this.__directiveAttributeDelimiters = defaultTirectiveAttributeDelimiters
    this.__eventAttributeDelimiters = defaultTventAttributeDelimiters
    this.mounted = false
    this.destroyed = false
  }

  destroy () {
    this.unmout()
    // delete this.model
    delete this.__rootView    
    // delete this.__rootElement
    delete this.__methods
    delete this.__binding
  }

  unmout () {
    if (!this.mounted) return
    this.viewWillUnmount.call(this)
    let _bindingOne
    while (_bindingOne = this.__binding.pop()) _bindingOne.destroy()

    this.__computedModel.destroy()
    this.__computedModel = null

    //将 methods 外跑到 view 层
    objForeach(this.__methods, (_, name) => delete this[name])

    this.mounted = false
    this.viewDidUmmount.call(this)
  }

  mount () {
    if (this.mounted) return
    this.viewWillMount.call(this)
    
    //处理计算属性  
    this.__computedModel = new Model({})
    objForeach(this.__computed, (computed, name) => {
      const modelPaths = [].concat(computed)
      const _computedFunction = modelPaths.pop()

      if (getType(_computedFunction) === 'function') {
        const routine = () => {
          return _computedFunction.apply(this, modelPaths.map(path => this.model.get(path)))
        }        
        this.__computedModel.__model[name] = routine()
        modelPaths.forEach(modelPath => {
          const linstener = () => {
            if (this.__computedModel) this.__computedModel.set(name, routine())
          }
          this.model.on(modelPath, linstener)
          this.__binding.push({
            destroy: () => this.model.off(modelPath, linstener) 
          })
        })
      }
    })

    //将 methods 外跑到 view 层
    objForeach(this.__methods, (methods, name) => {
      if (name.indexOf('__') === 0) throw 'methods 不能以 "__" 开头'
      this[name] = this.__methods[name].bind(this)
    })

    walk(this.__rootElement, element => {
      let returnValue
      switch (element.nodeType) {
        case 3: //text节点
          let tokens = parseTextTemplate(element.nodeValue, this.__textDelimiters)
          tokens.forEach( token => {
            let textNode = document.createTextNode(token.value)
            element.parentNode.insertBefore(textNode, element)
            if (token.type === 'binding') {
              let {path, formatters} = parseDirectiveValue(token.value)
              this.__binding.push(
                directive.text({textNode, path, formatters, view: this}))
            }
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
            // [directive-args]="xx.xx.xx | filter1(a) | filter2(b)"
            if ( type = parseAttributeName(name, this.__directiveAttributeDelimiters) ) {
              let {path, formatters} = parseDirectiveValue(value)
              let args = type.split('-')
              type = args.shift()              
              if ( directive.hasType(type) ) 
                directives.push({type, args, name, element, path, formatters, view: this})
            }

            //判断为事件绑定
            //(eventName)="xx.xx.xx($event, $element, $value, $xxx)"
            else if ( type = parseAttributeName(name, this.__eventAttributeDelimiters) ) {
              type.split('&').forEach(type => {
                let {functionName, args} = parseFunctionCallString(value)
                events.push({type, element, name, functionName, args})
              })
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
    this.viewDidMount.call(this)
  }

  get (path) {
    let value = this.__computedModel.get(path)
    return value != undefined ? value : this.model.get(path)
  }
  set (path, value) { this.model.set(path, value) }
  update (next) { this.model.update(next) }

  childView (element, mixins={}) {
    mixins.model = this.model
    mixins.computed = Object.assign({}, this.__computed, mixins.computed || {})
    mixins.methods = Object.assign(
      {}, 
      objForeach(this.__methods, (_, name) => {
        let __methods = this.__methods
        return function () { return __methods[name].apply(this, arguments) }
      }),
      mixins.methods || {}
    )

    const childView = new View(element, mixins)
    for (let prop of [
      '__rootView',
      '__textDelimiters',
      '__directiveAttributeDelimiters',
      '__eventAttributeDelimiters'
    ]) childView[prop] = this[prop]

    return childView
  }
}
