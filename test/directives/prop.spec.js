describe('directives-prop', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <div id="directives-prop">
      <input [prop:checked]="a"/>
    </div>
  `
  const modelObject = {a: true}
  const root = document.getElementById('directives-prop')
  let vm = Akatsuki(root, {model: modelObject})

  it('should init current',  () => {
    const el = root.querySelector('input')
    expect(el.checked).to.equal(true)
  })

  it('sync model change', done => {
    modelObject.a = false
    vm.update(modelObject)
    vm.nextTick(function () {
      const el = root.querySelector('input')
      expect(el.checked).to.equal(false)
      done()
    })
  })
})