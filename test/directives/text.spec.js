describe('directives-text', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <div id="directives-text">
      <span>\${a}</span>
      <span [text]="a"></span>
    </div>
  `
  const modelObject = {a: '123'}
  const root = document.getElementById('directives-text')
  let vm = Akatsuki(root, {model: modelObject})

  it('should init current',  () => {
    const el = root.querySelectorAll('span')
    expect(el[0].innerHTML).to.equal('123')
    expect(el[1].innerHTML).to.equal('123')
  })

  it('sync model change', done => {
    modelObject.a = '234'
    vm.update(modelObject)
    vm.nextTick(function () {
      const el = root.querySelectorAll('span')
      expect(el[0].innerHTML).to.equal('234')
      expect(el[1].innerHTML).to.equal('234')
      done()
    })
  })
})