import View from "./view"
import Model from "./model"
import {mixinHelper, directiveMapHelper} from './helpers'
import {getType, nextTick, assert} from './utils'
import config from './config'

export default function Akatsuki (element, options) {
  //合并 mixins
  if (options.mixins) options = mixinHelper(options, config.mixins)
  //处理 directives 的简写
  if (options.directives) options.directives = directiveMapHelper(options.directives)
  return new View(element, options).mount()
}

Object.assign(Akatsuki, { View, Model, getType, nextTick,

  /**
   * 全局mixins, 会hook到之后所有的实例中
   * @return {[object]}
   */
  mixins () {
    [].concat.apply([], arguments).forEach(mixin => {
      if (getType(mixin) === 'object') config.mixins.push(mixin)
    })
  },

  /**
   * 设置行内text的表达式格式， 默认是 ['${', '}']
   * @param  {[string]} delimiters
   * @return
   */
  textDelimiters (delimiters) {
    assert(!checkDelimiters,
      'textDelimiters wants a array with 2 string item.')
    config.defaultTextDelimiters = delimiters
  },

  /**
   * 设置directive的表达式格式， 默认是 ['[', ']']
   * @param  {[string]} delimiters
   * @return
   */
  directiveAttributeDelimiters (delimiters) {
    assert(!checkDelimiters,
      'directiveAttributeDelimiters wants a array with 2 string item.')
    config.defaultDirectiveAttributeDelimiters = delimiters
  },

  /**
   * 设置event的表达式格式， 默认是 ['(', ')']
   * @param  {[string]} delimiters
   * @return
   */
  eventAttributeDelimiters (delimiters) {
    assert(!checkDelimiters,
      'eventAttributeDelimiters wants a array with 2 string item.')
    config.defaultEventAttributeDelimiters = delimiters
  },

  /**
   * 是否启动异步dom修改，默认true, 开启的情况下，如果想取到变化后的dom，可以用nextTick。
   * @param  {Boolean} isAsync
   * @return
   */
  async (isAsync) { config.async = !!isAsync },
})

/**
 * 检测 delimiters 是否符合 [string, string] 的格式
 * @param  {[string, string]} delimiters
 * @return {boolean}
 */
function checkDelimiters (delimiters) {
  return getType(delimiters) === 'array' &&
    getType(delimiters[0]) === 'string' &&
    getType(delimiters[1]) === 'string'
}
