import View from "./view"
import Model from "./model"

export default function (element, {
  model = {},  
  directives = {},
  formatters = {},
  methods = {},
  computed = {},
  viewWillMount,
  viewDidMount,
  viewWillUnmount,
  viewDidUmmount,
}) {
  model = new Model(model)
  return new View(element, {
    model, directives, formatters, methods, computed,
    viewWillMount,
    viewDidMount,
    viewWillUnmount,
    viewDidUmmount,
  })
}