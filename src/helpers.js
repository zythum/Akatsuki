import {objForeach, getType} from './utils'

const defaultDirectiveConfig = {
  priority: 300,                  // 指令的权重，权重越高优先级越高
  stopParseChildElement: false,   // 是否继续遍历节点（否的话不会绑定子节点的指令和事件）
  stopParseNextDirective: false,  // 是否继续执行权重比他低的指令
  noValueFormatter: false,        // 是否传入routine方法时自动执行Formatter之后传入
  noClearAttribute: false,        // 是否自动清除当前指令在dom上的标记
  //bind, routine, unbind
}

/**
 * 处理 directives 的简单写法
 * @param  {{object or function}} configs
 * @return {defaultDirectiveConfig}
 * 
 * 如果 config 是 function 那么参数全部默认， function作为 routine
 * 否则 是和上面参数的 assign
 *
 * bind    指令绑定时调用
 * routine 指令获得数据时调用
 * unbind  指令解除绑定时调用
 *
 * 以上方法中可以使用 this 上的 {
 *  formatters
 *  element 
 *  attributeName
 *  arg
 *  model
 *  path
 *  view
 * }
 */
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

/**
 * 处理mixin属性 mixin可以成为设置的预设。让一些功能重用
 * @param  {array} options
 * @return
 */
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
  return result
}