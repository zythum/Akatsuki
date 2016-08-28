describe('directives-html', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <div id="directives-html">
      <span [html]="a"></span>
    </div>
  `
  const modelObject = {a: '<b>123</b>'}
  const root = document.getElementById('directives-html')
  let vm = Akatsuki(root, {model: modelObject})

  it('should init current',  () => {
    const el = root.querySelector('b')
    expect(el.innerHTML).to.equal('123')
  })

  it('sync model change', done => {
    modelObject.a = '<b>234</b>'
    vm.update(modelObject)
    vm.nextTick(function () {
      const el = root.querySelector('b')
      expect(el.innerHTML).to.equal('234')
      done()
    })
  })
})