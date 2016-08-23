import {objForeach, getType} from './utils'

const defaultDirectiveConfig = {
  priority: 300,
  stopParseChildElement: false,
  stopParseNextDirective: false,
  noValueFormatter: false,
  noClearAttribute: false,
}

export function directiveHelper (configs) {
  return objForeach(configs, config => {
    const configType = getType(config)

    if (configType != 'function' && configType != 'object') {
      throw "directive 必须是 object 或者 config"
    }
    if (configType === 'function') config = {routine: config}
    return Object.assign({}, defaultDirectiveConfig, config)
  })
}

const defaultMixinOptions = {
  mixins: [],
  directives: {},
  formatters: {},
  methods: {},
  computed: {},
  viewWillMount: null,
  viewDidMount: null,
  viewWillUnmount: null,
  viewDidUmmount: null,
}

export function mixinHelper (options = defaultMixinOptions) {
  options = Object.assign({}, options)

  let result = Object.assign({}, defaultMixinOptions)
  let mixins = options.mixins || []
  delete options.mixins

  //合并mixins
  mixins.push(options)
  
  mixins.forEach(mixin => {    
    //合并生命周期函数      
    [
      'viewWillMount', 
      'viewDidMount', 
      'viewWillUnmount', 
      'viewDidUmmount'
    ].forEach(key => {
      let prev = result[key], next = mixin[key]
      if ( getType(next) != 'function') return
      result[key] = getType(prev) === 'function' ? 
        function () { prev.call(this), next.call(this) } : 
        function () { next.call(this) }
    })
    //合并方法和计算属性
    for (let key of ['directives', 'formatters', 'methods', 'computed']) 
      Object.assign(result[key], mixin[key])
  })
}