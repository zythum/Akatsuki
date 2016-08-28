describe('directives-show', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <div id="directives-show">
      <span [show]="a"></span>
    </div>
  `
  const modelObject = {a: true}
  const root = document.getElementById('directives-show')
  let vm = Akatsuki(root, {model: modelObject})

  it('should init current',  () => {
    const el = root.querySelector('span')
    expect(el.style.display).to.equal('')
  })

  it('sync model change', done => {
    modelObject.a = false
    vm.update(modelObject)
    vm.nextTick(function () {
      const el = root.querySelector('span')
      expect(el.style.display).to.equal('none')
      done()
    })
  })
})