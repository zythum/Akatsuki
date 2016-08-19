import View from "./view"
import Model from "./model"

export default function (element, {
  model = {},
  methods = {},
  formatters = {},
  computed = {},
}) {
  model = new Model(model)
  return new View(element, {model, methods, formatters, computed})
}