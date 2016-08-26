import directivesText from './directives/text'
import directivesHtml from './directives/html'
import directivesIf from './directives/if'
import directivesClass from './directives/class'
import directivesAttr from './directives/attr'
import directivesProp from './directives/prop'
import directivesShow from './directives/show'
import directivesEach from './directives/each'
import directivesEl from './directives/el'
import {objForeach, nextTick} from './utils'
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
    let priority2 = (view.__directives[arg2.type] || directives[arg2.type]).priority
    let priority1 = (view.__directives[arg1.type] || directives[arg1.type]).priority
    return priority2 - priority1
  })
  for (let {type, args, name, element, path, formatters} of directiveArgs) {
    let directive = view.__directives[type] || directives[type]
    instances.push(bindDirective({ directive, args, name, element, path, formatters, view }))
    needBreak = needBreak || directive.stopParseChildElement
    if (directive.stopParseNextDirective) break
  }
  return {instances, needBreak}
}

directive.text = function directiveText ({textNode, path, formatters, view}) {
  const delimiters = view.__textDelimiters
  const [firstPath] = path.split('.')
  const model = view.__computed.hasOwnProperty(firstPath) ? view.computed : view.model
  const directiveTextListener = value => {
    value = execValueFormatter(value, formatters)
    if (view.mounted === true) {
      nextTick(() => textNode.nodeValue = value)
    } else {
      textNode.nodeValue = value
    }
  }
  formatters = parseFormatterArgs(formatters, view.__formatters, {
    $index: () => view.computed.get('$index'),
    $length: () => view.computed.get('$length')
  })
  directiveTextListener(model.get(path))
  model.on(path, directiveTextListener)
  objForeach(formatters.depends, dependPath => {
    view.computed.on(dependPath, directiveListener)
  })
  return {
    element: textNode,
    path: path,
    view: view,
    destroy () {
      objForeach(formatters.depends, dependPath => {
        view.computed.off(dependPath, directiveListener)
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
  formatters = parseFormatterArgs(formatters, view.__formatters, {
    $index: () => view.computed.get('$index'),
    $length: () => view.computed.get('$length')
  })
  const attribute = element.getAttributeNode(name)
  const [firstPath] = path.split('.')
  const model = view.__computed.hasOwnProperty(firstPath) ? view.computed : view.model
  const directiveListener = value => {
    if (directive.noValueFormatter === false) {
      value = execValueFormatter(value, formatters)
    }
    if (view.mounted === true) {
      nextTick(()=> callObjectFunctionIfExit(instance, directive, 'routine', value))
    } else {
      callObjectFunctionIfExit(instance, directive, 'routine', value)
    }
  }
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
        view.computed.off(dependPath, directiveListener)
      })
      model.off(path, directiveListener)
      callObjectFunctionIfExit(instance, directive, 'unbind')
      //把之前清掉的属性写回去
      if (directive.noClearAttribute === false) {
        element.setAttributeNode(attribute)
      }
      objForeach(instance, (_, key) => delete instance[key])
    }
  }
  //清掉的[directive]属性 美观起见
  if (directive.noClearAttribute === false) {
    element.removeAttributeNode(attribute)
  }
  callObjectFunctionIfExit(instance, directive, 'bind')
  directiveListener(model.get(path))
  model.on(path, directiveListener)
  objForeach(formatters.depends, dependPath => {
    view.computed.on(dependPath, directiveListener)
  })

  return instance
}

function callObjectFunctionIfExit (context, obj, functionName, ...args) {
  if (functionName in obj) obj[functionName].call(context, ...args)
}
