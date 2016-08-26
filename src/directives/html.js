import {directiveHelper} from '../helpers'
/**
 * [html]
 * 更新元素的 innerHTML,
 * <div [html]="your.model.path"><div>
 */
export default directiveHelper({
  displayName: 'html',
  stopParseChildElement: true,
  routine (value) {
    this.element.innerHTML = value
  }
})