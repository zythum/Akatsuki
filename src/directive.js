import directivesText from './directives/text'
import directivesHtml from './directives/html'
import directivesIf from './directives/if'
import directivesClass from './directives/class'
import directivesAttr from './directives/attr'
import directivesProp from './directives/prop'
import directivesShow from './directives/show'
import directivesEach from './directives/each'
import directivesEl from './directives/el'
import {objForeach} from './utils'
import {execValueFormatter, parseFormatterArgs} from './formatter'

let directives = {}
for (let directive of [
  directivesText, 
  directivesHtml, 
  directivesIf, 
  directivesClass,
  directivesAttr,
  directivesProp,
  directivesShow,
  directivesEach,
  directivesEl
]) directives[directive.displayName] = directive

export default function directive (directiveArgs, view) {
  let needBreak = false
  const instances = []
  directiveArgs.sort((arg1, arg2) => {
    return directives[arg2.type].priority - directives[arg1.type].priority
  })
  for (let {type, args, name, element, path, formatters} of directiveArgs) {
    let directive = directives[type]
    instances.push(bindDirective({ directive, args, name, element, path, formatters, view }))
    needBreak = needBreak || directive.stopParseChildElement
    if (directive.stopParseNextDirective) break
  }
  return {instances, needBreak}
}

directive.text = function directiveText ({textNode, path, formatters, view}) {
  const delimiters = view.__textDelimiters
  const model = view.__computedModel.get(path) != undefined ?
    view.__computedModel : view.model  
  const directiveTextListener = value => {
    textNode.nodeValue = execValueFormatter(value, formatters)
  }
  formatters = parseFormatterArgs(formatters, view.__formatters, {
    $index: () => view.__computedModel.get('$index'),
    $length: () => view.__computedModel.get('$length')
  })
  directiveTextListener(model.get(path))  
  model.on(path, directiveTextListener)
  objForeach(formatters.depends, dependPath => {
    view.__computedModel.on(dependPath, directiveListener)
  })
  return {
    element: textNode,
    path: path,
    view: view, 
    destroy () {
      objForeach(formatters.depends, dependPath => {
        view.__computedModel.off(dependPath, directiveListener)
      })
      model.off(path, directiveTextListener) 
      textNode.nodeValue = delimiters[0] + path + delimiters[1]
    } 
  }
}

directive.hasType = function hasType (type) {
  return directives.hasOwnProperty(type)
}

function bindDirective ({directive, element, path, args, name, formatters, view}) {
  const model = view.__computedModel.get(path) != undefined ?
    view.__computedModel : view.model  
  const directiveListener = value => {
    callObjectFunctionIfExit(instance, directive, 'routine', value)
  }
  formatters = parseFormatterArgs(formatters, view.__formatters, {
    $index: () => view.__computedModel.get('$index'),
    $length: () => view.__computedModel.get('$length')
  })
  const instance = {
    element: element,
    attributeName: name,
    model: model,
    path: path,
    formatters: formatters,
    view: view,
    args: args,
    destroy () {
      objForeach(formatters.depends, dependPath => {
        view.__computedModel.off(dependPath, directiveListener)
      })
      model.off(path, directiveListener)
      callObjectFunctionIfExit(instance, directive, 'unbind')
      objForeach(instance, (_, key) => delete instance[key])
    }
  }
  callObjectFunctionIfExit(instance, directive, 'bind')
  directiveListener(model.get(path))
  model.on(path, directiveListener)
  objForeach(formatters.depends, dependPath => {
    view.__computedModel.on(dependPath, directiveListener)
  })

  return instance
}

function callObjectFunctionIfExit (context, obj, functionName, ...args) {
  if (functionName in obj) obj[functionName].call(context, ...args)
}
