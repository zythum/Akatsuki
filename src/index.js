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

Object.assign(Akatsuki, {
  View, Model, getType, nextTick,
  mixins () {
    [].concat.apply([], arguments).forEach(mixin => {
      if (getType(mixin) === 'object') config.mixins.push(mixin)
    })
  },
  textDelimiters (delimiters) {
    assert(!checkDelimiters,
      'textDelimiters wants a array with 2 string item.')
    config.defaultTextDelimiters = delimiters
  },
  directiveAttributeDelimiters (delimiters) {
    assert(!checkDelimiters,
      'directiveAttributeDelimiters wants a array with 2 string item.')
    config.defaultDirectiveAttributeDelimiters = delimiters
  },
  eventAttributeDelimiters (delimiters) {
    assert(!checkDelimiters,
      'eventAttributeDelimiters wants a array with 2 string item.')
    config.defaultEventAttributeDelimiters = delimiters
  },
  async (isAsync) {
    config.async = !!isAsync
  }
})

function checkDelimiters (delimiters) {
  return getType(delimiters) === 'array' &&
    getType(delimiters[0]) === 'string' &&
    getType(delimiters[1]) === 'string'
}
