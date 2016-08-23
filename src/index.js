import View from "./view"
import Model from "./model"
import {directiveHelper} from './helpers'
import {getType, nextTick} from './utils'

export default function Akatsuki (element, options) {
  //合并 mixins
  if (options.mixins) options = mixinHelper(options)
  //处理 directives 的简写
  if (options.directives) options.directives = directiveHelper(options.directives)
  return new View(element, options).mount()
}

Akatsuki.View = View
Akatsuki.Model = Model
Akatsuki.getType = getType
Akatsuki.nextTick = nextTick
