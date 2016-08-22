var rootElement = document.querySelector('.todoapp')

var todoapp = Akatsuki(rootElement, {
  model: { 
    filter: 'all',
    todos: [
      {title: '今天天气不错', completed: false},
      {title: '吃晚饭后跑两圈', completed: false},
      {title: '周日去定羽毛球场地', completed: false}
    ]    
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
    createTodo: function (event, element, value) {
      if (value.trim().length === 0) return
      var unshiftData = {title: value, completed: false}
      this.update({
        todos: { $unshift: unshiftData }
      })
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