/**
 *  [text]
 * 更新元素的 textContent, 也可以直接使用 `${your.model.path}` 的方式写在内容体内。
 *
 * <div [text]="your.model.path"><div>
 * <div>${your.model.path}<div>
 * ${your.model.path} 的实现在 directive.text中
 */
export default {
  displayName: 'text',
  priority: 300,
  stopParseChildElement: true,
  stopParseNextDirective: false,
  noValueFormatter: false,
  noClearAttribute: false,
  routine (value) {
    this.element.innerHTML = ''
    this.element.appendChild(document.createTextNode(value))
  }
}