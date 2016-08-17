export function parseAttributeName (attributeName, delimiters) {
  let [start, end] = delimiters
  if (attributeName.indexOf(start) != 0) return false
  if (attributeName.lastIndexOf(end) != attributeName.length - end.length) return false
  return attributeName.slice(start.length, -end.length)
}

export function parseTextTemplate (template, delimiters) {
  const length = template.length
  let tokens = []
  let lastIndex = 0

  while (lastIndex < length) {
    let index = template.indexOf(delimiters[0], lastIndex)
    if (index < 0) {
      tokens.push({type: 'text', value: template.slice(lastIndex)})
      break
    } else {
      if (index > 0 && lastIndex < index) {
        tokens.push({type: 'text', value: template.slice(lastIndex, index)})
      }
      lastIndex = index + delimiters[0].length
      index = template.indexOf(delimiters[1], lastIndex)
      if (index < 0) {
        let substring = template.slice(lastIndex) - delimiters[1].length
        let lastToken = tokens[tokens.length - 1]
        if (lastToken && lastToken.type === 'text') {
          lastToken.value += substring
        } else {
          tokens.push({type: 'text', value: substring})
        }
        break
      }
      let value = template.slice(lastIndex, index).trim()
      tokens.push({type: 'binding', value: value})
      lastIndex = index + delimiters[1].length
    }
  }
  return tokens
}