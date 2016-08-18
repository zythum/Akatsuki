import {objForeach, getType} from '../utils'

export default objForeach({

  '+':   (number, [arg]) => number + parseFloat(arg),
  '-':   (number, [arg]) => number - parseFloat(arg),
  '*':   (number, [arg]) => number * parseFloat(arg),
  '/':   (number, [arg]) => number / parseFloat(arg),
  '%':   (number, [arg]) => number % parseFloat(arg),

  '-x':   (number, [arg]) => parseFloat(arg) - number,
  '/x':   (number, [arg]) => parseFloat(arg) / number,
  '%x':   (number, [arg]) => parseFloat(arg) % number,

  toFixed (number, [arg]) { return number.toFixed(arg) },

  'date': function (number, [format]) {
    return dateFormat(new Date(number), format)
  },

}, (formatter, name) => {
  return (target, args) => {
    return formatter(parseFloat(target), args === undefined ? [] : [].concat(args))
  }
})