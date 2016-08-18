import directivesText from './directives/text'
import directivesHtml from './directives/html'
import directivesIf from './directives/if'
import directivesEach from './directives/each'
import {objForeach} from './utils'

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
  directiveArgs.sort(([type1], [type2]) => {
    return directives[type2].priority - directives[type1].priority
  })
  for (let [type, element, path, args, attributeName] of directiveArgs) {    
    instances.push(bindDirective(directives[type], element, path, args, view, attributeName))
    needBreak = needBreak || directives[type].stopParseChildElement
    if (directives[type].stopParseNextDirective) break
  }
  return {instances, needBreak}
}

directive.text = function directiveText (textNode, path, view) {
  const delimiters = view.__textDelimiters
  const model = view.__computedModel.get(path) != undefined ?
    view.__computedModel : view.model  
  const directiveTextListener = value => textNode.nodeValue = value

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

function bindDirective (directive, element, path, args, view, attributeName) {
  const model = view.__computedModel.get(path) != undefined ?
    view.__computedModel : view.model  
  const directiveListener = value => callObjectFunctionIfExit(instance, directive, 'routine', value)
  const instance = {
    element: element,
    attributeName: attributeName,
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
