import {
  parseTextTemplate,
  parseAttributeName,
  parseDirectiveName,
  parseDirectiveValue,
  parseFunctionCallString
} from './parser'

import {noop, objForeach, getType, walk, nextTick, assert} from './utils'
import directive from './directive'
import Model from './model'
import event from './event'
import config from './config'

const ModelUpdate = Model.prototype.update

export default class View {
  constructor (element, {
    model = {},
    mixins = [],
    directives = {},
    formatters = {},
    methods = {},
    computed = {},
    viewWillMount = noop,
    viewDidMount = noop,
    viewWillUnmount = noop,
    viewDidUmmount = noop,
  }) {

    this.els = {}
    this.model = model instanceof Model ? model : new Model(model || {})
    this.computed = null
    this.__rootView = this
    this.__rootElement = element

    this.__binding = []

    this.__directives = directives
    this.__formatters = formatters
    this.__methods = methods
    this.__computed = computed

    //生命周期
    this.mounted = false
    this.destroyed = false
    this.viewWillMount = viewWillMount
    this.viewDidMount = viewDidMount
    this.viewWillUnmount = viewWillUnmount
    this.viewDidUmmount = viewDidUmmount

    //默认标示设置
    this.__textDelimiters = config.defaultTextDelimiters
    this.__directiveAttributeDelimiters = config.defaultDirectiveAttributeDelimiters
    this.__eventAttributeDelimiters = config.defaultEventAttributeDelimiters
  }

  destroy () {
    this.unmount()
    this.destroyed = true

    delete this.model
    delete this.els
    delete this.__rootView
    delete this.__rootElement
    delete this.__binding
    delete this.__directives
    delete this.__formatters
    delete this.__methods
    delete this.__computed
    delete this.computed
    delete this.viewWillMount
    delete this.viewDidMount
    delete this.viewWillUnmount
    delete this.viewDidUmmount
    delete this.mounted
  }

  unmount () {
    if (!this.mounted) return
    this.viewWillUnmount()
    let _bindingOne
    while (_bindingOne = this.__binding.pop()) _bindingOne.destroy()

    this.computed.destroy()
    this.computed = null

    //将 methods 外跑到 view 层
    objForeach(this.__methods, (_, name) => delete this[name])

    this.mounted = false
    this.viewDidUmmount()
    return this
  }

  mount () {
    if (this.mounted) return
    this.viewWillMount()

    //处理计算属性
    this.computed = new Model({})
    //封掉 computed 的设置方法。不给用2333
    this.computed.set = undefined
    this.computed.update = undefined
    objForeach(this.__computed, (computed, name) => {
      const modelPaths = [].concat(computed)
      let _computedFunction = modelPaths.pop()
      let model = this.model
      //如果最后一个参数是 Model, 那么说明监听的是这个 model 的值的变化产生新值，默认是自己的 model
      if (_computedFunction instanceof Model) {
        [model, _computedFunction] = [_computedFunction, modelPaths.pop()]
      }

      if (getType(_computedFunction) === 'function') {
        const routine = () => {
          return _computedFunction.apply(this, modelPaths.map(path => model.get(path)))
        }
        this.computed.__model[name] = routine()
        modelPaths.forEach(modelPath => {
          const linstener = () => {
            if (this.computed)
              ModelUpdate.call(this.computed, { [name]: {$set: routine()} })
          }
          model.on(modelPath, linstener)
          this.__binding.push({ destroy () { model.off(modelPath, linstener) } })
        })
      }
    })

    //将 methods 外跑到 view 层
    objForeach(this.__methods, (methods, name) => {
      assert(name.indexOf('__') === 0,
        `method name %s is not allowed, method name can not start with "__".`, name)
      assert(this[name] != undefined,
        `method name %s is not allowed, name is an exist method.`, name)

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
                directive.text({textNode, path, formatters, directivesValue: token.value, view: this}))
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
              if ( directive.hasType(directiveType) || this.__directives.hasOwnProperty(directiveType) )
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
    return this
  }

  //hook model的相关方法
  get (path) { return this.model.get(path) }
  set (path, value) { this.model.set(path, value); return this }
  update (...next) { this.model.update(...next); return this }
  path (path) { return this.model.path(path) }
  each (iteratee) { return this.model.each(iteratee) }

  //hook nextTick this指向自己
  nextTick (fn) {nextTick(fn, this)}
}

//创建子view
export function createChildView (parentView, element, mixins={}) {
  
  const bindParentComputed = objForeach(parentView.__computed, (_, name) => 
    [name, value => value, parentView.computed])

  mixins.model = parentView.model
  mixins.computed = Object.assign({}, bindParentComputed, mixins.computed || {})
  mixins.directives = Object.assign({}, parentView.__directives, mixins.__directives || {})

  ;['formatters', 'methods'].forEach(prop => {
    let wrapper = objForeach(parentView[`__${prop}`], (_, name) => {
      // 这里用 parentView[`__${prop}`][name] 而不只是直接用对应值是留一个运行时修改的余地
      let self = parentView[`__${prop}`]
      return function () { return self[name].apply(parentView, arguments) }
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
  ]) childView[prop] = parentView[prop]

  return childView
}
