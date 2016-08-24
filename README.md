# Akatsuki

> 暁よ。一人前のレディーとして扱ってよね！
> 
> 我是晓，要把我当成独当一面的 ~~小学生~~ ~~Lady~~ MVVM 看哟!

```
<!--demo: hello world-->
<div id="main">${greeting}</div>

<script>
Akatsuki(document.getElementById('main'), {
    model: {greeting: 'Hello, world.'}
})
</scirpt>

```

---

## 开发 Akatsuki

git clone 下来之后执行下面命令

```
$ npm install
$ npm run build 
```

`src`: 原 ~~🐎~~ 码目录; 
`dist`: 生成文件目录; 
`demo`: ~~呆毛~~ ~~🌰~~ 例子目录

---

## 使用 Akatsuki

### directives
> directives 是插入html中的一些指令，来处理渲染逻辑。

Akatsuki 的指令使用 `[directive:arg]="my.model.path | formatter"` 的格式。

+ directive 是指令类型，
+ arg 是指令参数，
+ my.model.path 是指令监听的model的path, 
+ formatter 是对于 model 数据的值处理（相见 formatters）


#### [text]
> 更新元素的 textContent, 也可以直接使用 `${my.model.path}` 的方式写在内容体内。

```
<div [text]="my.model.path"><div>
<div>${my.model.path}<div>
```

#### [html]
> 更新元素的 innerHTML。

⚠️尽量使用`[text]` `${}`的方式而不是修改innerHTML, 直接渲染html是有xss风险的，特别是内容是用户输入的情况下。

```
<div [html]="my.model.path"><div>
```
#### [class:className1 className2]
> 更新元素的 className。

`arg` 控制的className值，可以多个空格分隔

```
<div [class:current]="my.model.path"><div>
<div [class:current selected]="my.model.path"><div>
<div 
    [class:current]="my.model.path" 
    [class:current]="another.model.path">
<div>
```
#### [prop:propertyName]
> 更新元素的 property 属性，比如 checked 等。

`arg` 控制的 property 的name

```
<input type="checkbox" [prop:checked]="my.model.path"/>
```

#### [attr:attributeName]
> 更新元素的 attribute 属性，
请区分 attribute 和 prop 的区别。 [http://www.jianshu.com/p/rRssiL](http://www.jianshu.com/p/rRssiL)

`arg` 控制的 attribute 的 name 

```
<input type="checkbox" [attr:data-info]="my.model.path"/>
```

#### [show]
> 更新元素的 `style.display` 属性。

⚠️show只是在 `'none'` `''` 之前切换，特殊的css处理会对show有一定影响

```
<div class="modal" [show]="my.model.path"></div>
```

#### [el:alias]
> 获取 elemet 节点, 可以在 `els` 属性上获得它。

`alias` els 上对应的key名

⚠️ 同名的el只能存在提个，Akastuki设计是抢占式的

```
<div id="root">
    <input [els:user] name="userName" value="用户名" />
</div>

<script>
Akatsuki(document.getElementById('root'), {
    viewDidMount: function () {
        this.els.user.value === '用户名'
    }
})    
</script>
```

#### [if]
> 根据表达式的值的真假渲染element。在切换时元素及它的数据绑定被销毁并重建。

请区别 [if] 和 ［show］，虽然一般来说表现效果一致，但是内在实现完全不同，
[if] 不显示时不显示的dom是不存在的， [show] 只是`display:none`了而已

```
<div [if]="my.model.path"> 暁よ。一人前のレディーとして扱ってよね！</div>
```

#### [each:item]
> 根据表达式的值(数组)的渲染列表。

`arg` 内部遍历到的数组的当前元素名

`$index` 内部遍历到的数组的当前index

`$lengh` 内部遍历到的数组的长度

```
<ul>
  <li [each:item]="list.path" [class:current]="item.current">
    ${$index} | ${item.text} | ${$length}
  </li>
</ul>
```

#### 自定义 directive

> 朱一很懒，困了， 碎觉去了

---

### model
> model 是数据的核心，能够判断数据的变化在改变view。
> 在使用 Akatsuki 的过程中大部分时间都是在操作model
>
> `path`: `a.b.c` 这样形式的字符串称为path, 对应 `object['a']['b']['c']`。 在 path 中 数组的下标用 $0, $1 这样的 $数字 的方式表示。 比如 `array.$0`
>  
> ⚠️ 对于model的操作请全部时候model提供的api来处理，如果对于get到的model数据直接操作是不会导致model变化的，因为model所有set，get都是对象的拷贝，
> 
> ⚠️ 对于组成model的对象的key名是有限制的。
> 
> + 不支持存在 "." 字符的key名(会和 path 冲突)，
> + 不支持 "$" 字符开头的key名(会和 operation 冲突)，
> + 在view中，model的方法会hook到 instance上。可以通过类似 this.get方法获取。

#### get
> 从path获取对象,
> get到的数据是model中对应path的数据的深度拷贝，
> 你的修改并不会影响原model中的值。

+ @param  {path}
+ @return {any}

```javascript
model.get('my.model.path')
```

#### set
> 设置 path 对应的值。这个值可以是任何，如果传入的值是对象的话，它到model会经过深度拷贝，如果你在原对象变更的话，model中的值并会不收到影响

⚠️ 设置的值为对象时请设置为简单对象。否则会丢失信息

+ @param  {path}
+ @param  {any}
+ @return

```javascript
model.set('my.model.path', 'Akatsuki')
model.set('my.model.path', {name: 'Akatsuki'})
```

#### update
> 更新 model 对象, 中间设计model操作符(operation).详情请看下面的 operation 章节

⚠️ update和set是有区别的

+ update 支持 operation, set不行
+ update 支持 一次修改多个值， set不行
+ set 可以设置成任意值， update必须前后复制保持同一类型

存在两种调用方式

+ @param {string}
+ @param {value}

```javascript
model.update('name', 'Akatsuki')
model.update('$prefix', 'I love ')
```

和

+ @param  {{key: value}}

```javascript
model.update({name: 'Akatsuki'})
model.update({$prefix: 'Akatsuki'}) //$prefix是operation
```

#### on
> 绑定事件，当path的内容变更时触发

+ @param {path}
+ @param {function} -> {any}


```javascript
model.on('my.model.path', function (value) { 
    console.log('new value is ', value)
})
```

#### off
> 同 on, 是 on 的逆操作

#### path
> 短链接，可以认为是path相对路经

+ @param {path}
+ @return {Path} 返回一个类似Model的，和model api一样的对象，在上面操作传入的path都是相对当前路经的 

```javascript
var path = model.path('my')
path.set('model.path', 123)
path.get('model.path') === 123

```

#### each
> 一维遍历当前数组或者对象的model或者path.

+ @param {function} -> {path} {number} {path}

回调函数传值依次是

+ @param {path} 遍历开始后，当前获取到的元素的path
+ @param {number} 遍历开始后，当前获取到的元素的index
+ @param {path} 父元素的path

```javascript

model.path.set('goods', ['apple', 'car', 'bike', 'cake'])
model.path('goods').each(function (path, index, listPath) {
    console.log(path.get(), index, listPath.get())
})

// => apple 0 ['apple', 'car', 'bike', 'cake']
// => car 1 ['apple', 'car', 'bike', 'cake']
// => bike 2 ['apple', 'car', 'bike', 'cake']
// => cake 3 ['apple', 'car', 'bike', 'cake']
```

---
### methods
> methods 处理当前 view 中的所有事件，当前view给出的外跑还输，以及一些公用方法。
> 
> + methods 中的 this 指向当前 instance
> + methods 中的方法在mount后会直接挂在当前 instance 上。 umount会会移除
> + methods 只支持一维，值只能是 function

####页面绑定事件方式

页面标记 `(eventName.plugin)="methodsName(...args)"`

```
<!--页面绑定实例-->
<div id="root">
    <input (keyup.enter)="inputSubmit($value)" />
<div>
<script>
Akatsuki(document.getElementById('root'), {
    methods: {
        inputSubmit: function (value) {
            alert(value)
        }
    }
})
</script>
```

+ `eventName` 需要绑定的事件名
+ `plugin` 当前事件的一些插件
    + `.stop` 阻止事件冒泡
    + `.prevent` 阻止浏览器默认行为
    + `.capture` 绑定为捕获模式
    + `.keyCodeMap` 输入某些键触发
        + `esc` `tab` `enter` `space` `delete` `up` `left` `right` `down`
        + 单个字母和数字键 比如 `a` `v` `s` `1` `2` `0`
+ `methodsName` 对应 methods 中的哪个方法
+ `...args` 传入 methodsName 对应方法的参数。可以多个，逗号分隔 比如 `methodsName($index, $value, '111', 111, false)`
    + `$index`: 当前如果在each中的话当前元素的 index
    + `$length`: 当前如果在each中的话当前的数组 length
    + `$element`: 绑定事件的dom
    + `$event`: 事件触发的eventObject
    + `$value`: 当前绑定事件的dom的value
    + `'string'` `1` `false` `true` JSON 基本对象

---

### formatters
> 对于当前类似 `[text]="my.text"` 的 directive, 如果传入的值需要一些固定的改变再去变化的 dom 的话 可以使用 formatter 修饰。`[text]="my.text | prefix '$'"` 

例子：

```
<!--页面绑定实例-->
<div id="root">${my.text | prefix '¥' | suffix '.00'}<div>
<script>
Akatsuki(document.getElementById('root'), {
    model: {my: {text: 12}}
})
</script>

//=>  <div id="root">¥12.00<div>
```

#### 支持的格式

+ 空格风格 `[text]="my.num | > 0"`
+ 调用风格 `[text]="my.test | prefix('$')"`
+ 支持链式 `[text]="my.test | prefix '$' | suffix('.00')"`

#### 支持的参数

formatter空格后面或者括号中的参数。可以是JSON的简单数据类型，以及 `$index` `$length` (如果在`[each]` 中的话表示当前index和数组长度)

#### 自带的formatter

+ `toString` 返回数据的 toString() 方法
+ `count` 如果是数组返回length，如果是对象返回 keys.length。否则返回0
+ `empty` 如果是数组判断length是否为零，如果是对象判断 keys.length 是否为零。否则判断当前是否==false
+ `!empty` empty的取反
+ `<` 逻辑判断
+ `<=` 同上
+ `==` 同上
+ `===` 同上
+ `>=` 同上
+ `>` 同上
+ `!=` 同上
+ `!==` 同上
+ `??` 如果当前数据是空，那么使用参数（作为默认值使用）
+ `+` 数学运算
+ `-` 同上
+ `*` 同上
+ `/` 同上
+ `%` 同上
+ `-x` 数学运算 被减
+ `/x` 同上
+ `%x` 同上
+ `toFixed` 同 number.toFixed
+ `pad` 在前面补0.补到传入参数的位数
+ `date` 时间格式化 yyyy-MM-dd hh:mm:ss.S
+ `replace` 同 string.replace
+ `substr` 同 string.substr
+ `substring` 同 string.substring
+ `slice` 同 string.slice
+ `trim` 同 string.trim
+ `trimLeft` 同 string.trimLeft
+ `trimRight` 同 string.trimRight
+ `prefix` 在前面添加字符串
+ `suffix` 在后面添加字符串

#### 自定义formatter
> 朱一很懒，饿了，吃饭去

---

### operations
> model 操作符，用于简化 model操作

#### 数组

+ `$push`
+ `$pop`
+ `$unshift`
+ `$shift`
+ `$slice`
+ `$splice`
+ `$reverse`
+ `$sort`
+ `$filter`
+ `$map`
+ `$remove`

#### 布尔

+ `$toggle`

#### 数字

+ `$+`
+ `$-`
+ `$*`
+ `$/`
+ `$%`
+ `$-x`
+ `$/x`
+ `$%x`

#### 字符串

+ `$replace`
+ `$substr`
+ `$substring`
+ `$slice`
+ `$trim`
+ `$trimLeft`
+ `$trimRight`
+ `$append`
+ `$prepend`

#### 自定义

+ `exec`

---

### computed
> 计算属性， 如果有一些值需要一顶计算才能显示的，或者依赖多个值经过一定计算显示的
> 
> + computed 需要写明依赖的model的path，在处理函数中是拿不到 instance 的，只能对依赖的model进行计算
> + computed 对应的值不可以设置，但是可以通过 this.get方法获得

```
<!--页面绑定实例-->
<ul id="root">
    <li [each:todo]="filteredTodos">${todo.title}</li>
<ul>
<script>
Akatsuki(document.getElementById('root'), {
    model: {
        todos: [
            {title: '买鸡蛋', complated: true},
            {title: '买牛奶', complated: false}
        ]，
        filter: 'complated'
    },
    computed: {
        filteredTodos: ['todos', 'filter', function (todos, filter) {
          filter = ({
            active: function (todo) { return todo.completed === false},
            completed: function (todo) { return todo.completed === true}
          })[filter]
          return filter ? todos.filter(filter) : todos
        }]
    }
})
</script>
```

---

### lifeCycle
> lifeCycle 可以获取当前试图创建的时机
> 
> + lifeCycle 的方法中的 this 指向当前 instance
> + lifeCycle 的方法也会挂载载 instance 上。

#### viewWillMount
> 当视图准备 mount 前触发，这时 
> 
> + instance.model 已经挂载。
> + motheds 还没有绑定到 instance 上
> + 页面directives 还没有解析
> + this.els 还没有获取
> + computed 计算属性还没有生成

#### viewDidMount

> 当视图 mount 完成后触发，这时 
> 
> + instance.model 已经挂载。
> + motheds 已经绑定到 instance 上
> + 页面 directives 已经解析，directives 在dom上的标记已经清除
> + this.els 已经可以取到
> + computed 计算属性可以使用

#### viewWillUnMount

> 当视图准备 unmount 前触发，这时 
> 
> + instance.model 继续挂载。
> + motheds 还没有删除在 instance 上的绑定
> + 页面directives 还没有析构
> + this.els 还有
> + computed 计算属性还有

#### viewDidUnMount

> 当视图 unmount 完成后触发，这时 
> 
> + instance.model 还是挂载。
> + motheds 已经删除在 instance 上的绑定
> + 页面directives 已经卸载，恢复 directives 在dom上的标记
> + this.els 已经清除
> + computed 计算属性已经清除

---

### other

####Akatsuki.nextTick
> 在下一个事件循环时处理回调
> 
> + @param {function}
 
```javascript
Akatsuki.nextTick(function () {
    console.log('暁よ。一人前のレディーとして扱ってよね！')
})
```