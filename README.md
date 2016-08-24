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

Akatsuki 的指令使用 `[directive:arg]="your.model.path | formatter"` 的格式。

+ directive 是指令类型，
+ arg 是指令参数，
+ your.model.path 是指令监听的model的path, 
+ formatter 是对于 model 数据的值处理（相见 formatters）


#### [text]
> 更新元素的 textContent, 也可以直接使用 `${your.model.path}` 的方式写在内容体内。

```
<div [text]="your.model.path"><div>
<div>${your.model.path}<div>
```

#### [html]
> 更新元素的 innerHTML。

⚠️尽量使用`[text]` `${}`的方式而不是修改innerHTML, 直接渲染html是有xss风险的，特别是内容是用户输入的情况下。

```
<div [html]="your.model.path"><div>
```
#### [class:className1 className2]
> 更新元素的 className。

`arg` 控制的className值，可以多个空格分隔

```
<div [class:current]="your.model.path"><div>
<div [class:current selected]="your.model.path"><div>
<div 
    [class:current]="your.model.path" 
    [class:current]="another.model.path">
<div>
```
#### [prop:propertyName]
> 更新元素的 property 属性，比如 checked 等。

`arg` 控制的 property 的name

```
<input type="checkbox" [prop:checked]="your.model.path"/>
```

#### [attr:attributeName]
> 更新元素的 attribute 属性，
请区分 attribute 和 prop 的区别。 [http://www.jianshu.com/p/rRssiL](http://www.jianshu.com/p/rRssiL)

`arg` 控制的 attribute 的 name 

```
<input type="checkbox" [attr:data-info]="your.model.path"/>
```

#### [show]
> 更新元素的 `style.display` 属性。

⚠️show只是在 `'none'` `''` 之前切换，特殊的css处理会对show有一定影响

```
<div class="modal" [show]="your.model.path"></div>
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
<div [if]="your.model.path"> 暁よ。一人前のレディーとして扱ってよね！</div>
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

#### get
> 从path获取对象,
> get到的数据是model中对应path的数据的深度拷贝，
> 你的修改并不会影响原model中的值。

+ @param  {path}
+ @return {any}

```javascript
model.get('your.model.path')
```

#### set
> 设置 path 对应的值。这个值可以是任何，如果传入的值是对象的话，它到model会经过深度拷贝，如果你在原对象变更的话，model中的值并会不收到影响

⚠️ 设置的值为对象时请设置为简单对象。否则会丢失信息

+ @param  {path}
+ @param  {any}
+ @return

```javascript
model.set('your.model.path', 'Akatsuki')
model.set('your.model.path', {name: 'Akatsuki'})
```

#### update
> 更新 model 对象, 中间设计model操作符(operation).详情请看下面的 operation 章节

⚠️ update和set是有区别的

+ update 支持 operation, set不行
+ update 支持 一次修改多个值， set不行
+ set 可以设置成任意值， update必须前后复制保持同一类型

存在两种调用方式

@param {string}

@param {value}

```javascript
model.update('name', 'Akatsuki')
model.update('$prefix', 'I love ')
```

和

@param  {{key: value}}

```javascript
model.update({name: 'Akatsuki'})
model.update({$prefix: 'Akatsuki'})
```

#### on



#### off

#### path

#### each

---

### computed

---

### methods

---

### formatters

---

### operations

---

### lifeCycle

---

### other
