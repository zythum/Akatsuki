var rootElement = document.querySelector('.todoapp')
var storageKey = 'Akatsuki-todos'
var todos = localStorage.getItem(storageKey)
todos = JSON.parse(todos) || [
  {title: '今天天气不错', completed: false},
  {title: '吃晚饭后跑两圈', completed: false},
  {title: '周日去定羽毛球场地', completed: false}
]  

var todoapp = Akatsuki(rootElement, {
  model: { 
    editing:-1, filter: 'all', todos: todos   
  },
  viewDidMount: function () {
    this.sync(this.get('todos'))
    this.model.on('todos', this.sync)
  },
  viewWillUnmount: function () {
    this.model.off('todos', this.sync)
  },
  computed: {
    filteredTodos: ['todos', 'filter', function (todos, filter) {
      filter = ({
        active: function (todo) { return todo.completed === false},
        completed: function (todo) { return todo.completed === true}
      })[filter]
      return filter ? todos.filter(filter) : todos
    }],
    leftTodoCount: ['todos', function (todos) {
      return todos.filter(function (todo) {
        return todo.completed === false
      }).length
    }]
  },
  methods: {
    sync: function (todos) {
      localStorage.setItem(storageKey, JSON.stringify(todos))
    },
    createTodo: function (event, element, value) {
      if (value.trim().length === 0) return
      var unshiftData = {title: value, completed: false}
      this.path('todos').update({ $unshift: unshiftData })
      element.value = ''
    },
    edit: function (element, index) {
      this.set('editing', index)
      Akatsuki.nextTick(function () {
        element.parentNode.nextElementSibling.focus()
      })
    },
    startEdit: function (element, index) {
      element.value = this.get('todos.$' + index + '.title')      
    },
    finishEdit: function (element, value, index) {
      this.set('editing', -1)
      value = value.trim()
      if (value.length) {
        this.set('todos.$' + index + '.title', value)
      }
      element.value = ''
    },
    cancelEdit: function (element) {
      this.set('editing', -1)
      element.value = ''
    },
    toggleAll: function () {
      var hasLeft = this.get('leftTodoCount') > 0
      this.pathForEach('todos', function (path) {
        path.set('completed', hasLeft)
      })
    },
    toggleItem: function (index) {
      this.path('todos.$' + index + '.completed').update({$toggle: true})
    },
    deleteItem: function (index) {
      this.path('todos').update({$remove: index})
    },
    filter: function (type) {
      this.set('filter', type)
    }
  }
})