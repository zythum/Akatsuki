describe('directives-el', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <div id="directives-el">
      <ul>
        <li class="item" [el:a]></li>
      </ul>
    </div>
  `
  const modelObject = {}
  const root = document.getElementById('directives-el')
  let vm = Akatsuki(root, {model: modelObject})

  it('should init current',  () => {
    expect(vm.els.a.className).to.equal('item')
  })
})