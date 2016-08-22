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
    this.model.on('editing', this.editingChange)
  },
  viewWillUnmount: function () {
    this.model.off('todos', this.sync)
    this.model.off('editing', this.editingChange)
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
    editingChange: function (editing) {
      if (editing >= 0) {
        setTimeout(function () {
          this.els.list.children[editing]
            .querySelector('.edit').focus()
        }.bind(this))
      }
    },
    createTodo: function (event, element, value) {
      if (value.trim().length === 0) return
      var unshiftData = {title: value, completed: false}
      this.update({
        todos: { $unshift: unshiftData }
      })
      element.value = ''
    },
    edit: function (index) {
      this.set('editing', index)
    },
    startEdit: function (index, element) {
      var path = 'todos.$' + index + '.title'      
      element.value = this.get(path)
    },
    finishEdit: function (index, element, value) {
      this.set('editing', -1)
      value = value.trim()
      if (value.length) {
        var path = 'todos.$' + index + '.title'
        this.set(path, value)
      }
      element.value = ''
    },
    cancelEdit: function (element) {
      this.set('editing', -1)
      element.value = ''
    },
    toggleAll: function () {
      var hasLeft = this.get('leftTodoCount') > 0
      this.get('todos').forEach(function (todo, index) {
        var path = 'todos.$' + index + '.completed'
        this.set(path, hasLeft)
      }.bind(this))
    },
    toggleItem: function (index) {
      var path = 'todos.$' + index + '.completed'
      this.set(path, !this.get(path))
    },
    deleteItem: function (index) {
      this.update({todos: {$remove: index}})
    },
    filter: function (type) {
      this.set('filter', type)
    }
  }
})
todoapp.mount()