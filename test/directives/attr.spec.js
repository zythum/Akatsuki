describe('directives-attr', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <div id="directives-attr">
      <span [attr:data-info]="a"></span>
    </div>
  `
  const modelObject = {a: '123'}
  const root = document.getElementById('directives-attr')
  let vm = Akatsuki(root, {model: modelObject})

  it('should init current',  () => {
    const el = root.querySelector('span')
    expect(el.getAttribute('data-info')).to.equal('123')
  })

  it('sync model change', done => {
    modelObject.a = '234'
    vm.update(modelObject)
    vm.nextTick(function () {
      const el = root.querySelector('span')
      expect(el.getAttribute('data-info')).to.equal('234')
      done()
    })
  })
})