import {  
  parseTextTemplate, 
  parseAttributeName, 
  parseDirectiveName, 
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
    mixins = [],    
    formatters = {},
    methods = {},
    computed = {},
    viewWillMount = noop,
    viewDidMount = noop,
    viewWillUnmount = noop,
    viewDidUmmount = noop,
  }) {
    this.mounted = false
    this.destroyed = false

    this.model = model
    this.els = {}
    this.__rootView = this
    this.__rootElement = element
    this.__computedModel = null

    this.__binding = []
    this.__textDelimiters = defaultTextDelimiters
    this.__directiveAttributeDelimiters = defaultTirectiveAttributeDelimiters
    this.__eventAttributeDelimiters = defaultTventAttributeDelimiters
    
    this.__methods = {}
    this.__formatters = {}
    this.__computed = {}
    
    this.viewWillMount = null
    this.viewDidMount = null
    this.viewWillUnmount = null
    this.viewDidUmmount = null

    //合并mixins
    mixins.push({
      formatters, methods, computed,
      viewWillMount, viewDidMount, viewWillUnmount, viewDidUmmount
    })
    
    mixins.forEach(mixin => {
      
      //合并生命周期函数      
      [
        'viewWillMount', 
        'viewDidMount', 
        'viewWillUnmount', 
        'viewDidUmmount'
      ].forEach(key => {
        let prev = this[key], next = mixin[key]
        if ( getType(next) != 'function') return
        this[key] = getType(prev) === 'function' ? 
          ()=> { prev.call(this), next.call(this) } : ()=> next.call(this)
      })

      //合并方法和计算属性
      for (let key of ['methods', 'formatters', 'computed']) 
        Object.assign(this[`__${key}`], mixin[key])
    })  
  }

  destroy () {
    this.unmout()
    this.destroyed = true

    delete this.model
    delete this.els
    delete this.__rootView    
    delete this.__rootElement
    delete this.__binding
    delete this.__methods
    delete this.__computed
    delete this.__computedModel
    delete this.viewWillMount
    delete this.viewDidMount
    delete this.viewWillUnmount
    delete this.viewDidUmmount
    delete this.mounted
  }

  unmout () {
    if (!this.mounted) return
    this.viewWillUnmount()
    let _bindingOne
    while (_bindingOne = this.__binding.pop()) _bindingOne.destroy()

    this.__computedModel.destroy()
    this.__computedModel = null

    //将 methods 外跑到 view 层
    objForeach(this.__methods, (_, name) => delete this[name])

    this.mounted = false
    this.viewDidUmmount()
  }

  mount () {
    if (this.mounted) return
    this.viewWillMount()
    
    //处理计算属性  
    this.__computedModel = new Model({})
    objForeach(this.__computed, (computed, name) => {
      const modelPaths = [].concat(computed)
      let _computedFunction = modelPaths.pop()
      let model = this.model
      if (_computedFunction instanceof Model) {
        [model, _computedFunction] = [_computedFunction, modelPaths.pop()]
      }

      if (getType(_computedFunction) === 'function') {
        const routine = () => {
          return _computedFunction.apply(this, modelPaths.map(path => model.get(path)))
        }        
        this.__computedModel.__model[name] = routine()
        modelPaths.forEach(modelPath => {
          const linstener = () => {
            if (this.__computedModel) this.__computedModel.set(name, routine())
          }
          model.on(modelPath, linstener)
          this.__binding.push({
            destroy: () => model.off(modelPath, linstener) 
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
            let type, {name, value} = attributes[idx]
            //判断为数据绑定
            // [directive-args]="xx.xx.xx | filter1(a) | filter2(b)"
            if ( type = parseAttributeName(name, this.__directiveAttributeDelimiters) ) {
              let {directiveType, args} = parseDirectiveName(type)
              let {path, formatters} = parseDirectiveValue(value)
              if ( directive.hasType(directiveType) ) 
                directives.push({type: directiveType, args, name, element, path, formatters, view: this})
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
          if (returnValue != false && events.length) {
            let evtHandler = event(events, this)
            evtHandler.forEach(ins => this.__binding.push(ins))
          }
          break

        default: break
      }
      return returnValue
    })
    this.mounted = true
    this.viewDidMount()
  }

  get (path) {
    let value = this.__computedModel.get(path)
    return value != undefined ? value : this.model.get(path)
  }
  
  set (path, value) { this.model.set(path, value) }
  
  update (next) { this.model.update(next) }

  path (path) { return this.model.path(path) }

  pathForEach (path, iteratee) { return this.model.pathForEach(path, iteratee) }

  childView (element, mixins={}) {
    mixins.model = this.model
    mixins.computed = Object.assign({}, this.__computed, mixins.computed || {})
    
    ;['methods', 'formatters'].forEach(prop => {
      let wrapper = objForeach(this[`__${prop}`], (_, name) => {
        // 这里用 this[`__${prop}`][name] 而不只是直接用对应值是留一个运行时修改的余地
        let self = this[`__${prop}`]
        return function () { return self[name].apply(this, arguments) }
      })
      mixins[prop] = Object.assign({}, wrapper, mixins[prop] || {})
    })

    const childView = new View(element, mixins)
    
    //把parent的一些东西写回去
    for (let prop of [
      '__rootView',
      '__textDelimiters',
      '__directiveAttributeDelimiters',
      '__eventAttributeDelimiters'
    ]) childView[prop] = this[prop]

    return childView
  }
}
