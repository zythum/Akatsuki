describe('directives-if', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <div id="directives-if">
      <span [if]="a"></span>
    </div>
  `
  const modelObject = {a: true}
  const root = document.getElementById('directives-if')
  let vm = Akatsuki(root, {model: modelObject})

  it('should init current',  () => {
    const els = root.querySelectorAll('span')
    expect(els).to.not.empty
  })

  it('sync model change', done => {
    modelObject.a = false
    vm.update(modelObject)
    vm.nextTick(function () {
      const els = root.querySelectorAll('span')
      expect(els).to.empty
      done()
    })
  })
})