/**
 * [html]
 * 更新元素的 innerHTML, 
 * <div [html]="your.model.path"><div>
 */
export default {
  displayName: 'html',
  priority: 300,
  stopParseChildElement: true,
  stopParseNextDirective: false,
  noValueFormatter: false,
  noClearAttribute: false,
  routine (value) {
    this.element.innerHTML = value
  }
}