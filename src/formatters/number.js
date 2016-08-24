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
    return formatter.call(object, parseFloat(target), arg)
  }
})