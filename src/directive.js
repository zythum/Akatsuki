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
  for (let [type, element, path, args] of directiveArgs) {    
    instances.push(bindOperation(directives[type], element, path, args, view))
    needBreak = needBreak || directives[type].stopParseChildElement
    if (directives[type].stopParseNextDirective) break
  }
  return {instances, needBreak}
}

directive.text = function directiveText (textNode, path, view) {
  const delimiters = view.__textDelimiters
  const model = view.__computedModel.get(path) != undefined ?
    view.__computedModel : view.model  
  const modelListen = value => {
    textNode.nodeValue = value
    return modelListen
  }
  let prevValue = textNode.nodeValue
  model.on(path, modelListen(model.get(path)))
  return {
    element: textNode,
    path: path,
    view: view, 
    destroy () {    
      model.off(path, modelListen) 
      textNode.nodeValue = delimiters[0] + path + delimiters[1]
    } 
  }
}

directive.hasType = function hasType (type) {
  return directives.hasOwnProperty(type)
}

function bindOperation (directive, element, path, args, view) {
  const model = view.__computedModel.get(path) != undefined ?
    view.__computedModel : view.model
  const modelListen = value => {
    callObjectFunctionIfExit(instance, directive, 'routine', value)
    return modelListen
  }
  const instance = {
    element: element,
    path: path,
    view: view,
    args: args,
    destroy () {
      model.off(path, modelListen)
      callObjectFunctionIfExit(instance, directive, 'unbind')
      objForeach(instance, (_, key) => delete instance[key])
    }
  }
  callObjectFunctionIfExit(instance, directive, 'bind')
  model.on(path, modelListen(model.get(path)))
  return instance
}

function callObjectFunctionIfExit (context, obj, functionName, ...args) {
  if (functionName in obj) obj[functionName].call(context, ...args)
}
