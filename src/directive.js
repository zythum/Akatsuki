import directivesText from './directives/text'
import directivesHtml from './directives/html'
import directivesIf from './directives/if'
import directivesEach from './directives/each'
import {objForeach} from './utils'
import {execformatter} from './formatter'

let directives = {}
for (let directive of [
  directivesText, 
  directivesHtml, 
  directivesIf, 
  directivesEach
]) directives[directive.displayName] = directive

export default function directive (directiveArgs, view) {
  let needBreak = false
  const instances = []
  directiveArgs.sort((a, b) => {
    return directives[b.type].priority - directives[a.type].priority
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
    textNode.nodeValue = execformatter(value, formatters)
  }
  directiveTextListener(model.get(path))  
  model.on(path, directiveTextListener)
  return {
    element: textNode,
    path: path,
    view: view, 
    destroy () {    
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
    value = execformatter(value, formatters)
    callObjectFunctionIfExit(instance, directive, 'routine', value)
  }
  const instance = {
    element: element,
    attributeName: name,
    formatters: formatters,
    path: path,
    view: view,
    args: args,
    destroy () {
      model.off(path, directiveListener)
      callObjectFunctionIfExit(instance, directive, 'unbind')
      objForeach(instance, (_, key) => delete instance[key])
    }
  }
  callObjectFunctionIfExit(instance, directive, 'bind')
  directiveListener(model.get(path))
  model.on(path, directiveListener)
  return instance
}

function callObjectFunctionIfExit (context, obj, functionName, ...args) {
  if (functionName in obj) obj[functionName].call(context, ...args)
}
