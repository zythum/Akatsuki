var rootElement = document.querySelector('.todoapp')

var todoapp = akatsuki(rootElement, {
  model: { 
    filter: 'all',
    todos: [
      {title: 'aaa', completed: true}
    ]    
  },
  computed: {
    filteredTodos: ['todos', 'filter', function (todos, filter) {
      if (filter === 'active') {
        return todos.filter(function (todo) {
          return todo.completed === false
        })
      }
      if (filter === 'completed') {
        return todos.filter(function (todo) {
          return todo.completed === true
        })
      }
      return todos
    }],
    leftTodoCount: ['todos', function (todos) {
      return todos.filter(function (todo) {
        return todo.completed === false
      }).length
    }]
  },
  methods: {
    createTodo: function (event, element) {
      var unshiftData = {title: element.value, completed: false}
      this.update({
        todos: {
          $unshift: unshiftData
        }
      })
      element.value = ''
    },
    toggleAll: function () {
      var hasLeft = this.get('leftTodoCount') > 0
      var self = this
      this.get('todos').forEach(function (todo, index) {
        var path = 'todos.$' + index + '.completed'
        self.set(path, hasLeft)
      })
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