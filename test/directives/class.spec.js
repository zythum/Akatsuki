describe('directives-class', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <div id="directives-class">
      <ul>
        <li class="item" [class:current]="a"></li>
      </ul>
    </div>
  `
  const modelObject = {a: true}
  const root = document.getElementById('directives-class')
  let vm = Akatsuki(root, {model: modelObject})

  it('should init current',  () => {
    const el = root.querySelector('li')
    expect(el.className).to.equal('item current')
  })

  it('sync model change', done => {
    modelObject.a = false
    vm.update(modelObject)
    vm.nextTick(function () {
      const el = root.querySelector('li')
      expect(el.className).to.equal('item')
      done()
    })
  })
})