import {objForeach, getType} from '../utils'

export default objForeach({

  '+':   (number, [arg]) => number + parseFloat(arg),
  '-':   (number, [arg]) => number - parseFloat(arg),
  '*':   (number, [arg]) => number * parseFloat(arg),
  '/':   (number, [arg]) => number / parseFloat(arg),
  '%':   (number, [arg]) => number % parseFloat(arg),

  //被减，被除，被余
  '-x':   (number, [arg]) => parseFloat(arg) - number,
  '/x':   (number, [arg]) => parseFloat(arg) / number,
  '%x':   (number, [arg]) => parseFloat(arg) % number,

  toFixed (number, [arg]) { return number.toFixed(arg) },

  pad (number, [arg]) {
    arg = parseFloat(arg)
    return (Array(arg).join(0) + number).slice(-arg)
  },

  date (number, [format]) {
    return dateFormat(new Date(number), format)
  },

}, (formatter, name, object) => {
  return (target, args) => {
    args = args.map(arg => getType(arg) === 'function' ? arg() : arg)
    return formatter.call(object, parseFloat(target), args)
  }
})

/**
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * 例子：
 * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 */
function dateFormat (date, fmt) {
  var o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    'S': date.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ?
        (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
  return fmt
}