describe('directives-each', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <ul id="directives-each">
      <li [each:item]="a">\${item} | \${$index} | \${$length}</li>
    </ul>
  `
  const modelObject = {a: [1,2,3]}
  const root = document.getElementById('directives-each')
  let vm = Akatsuki(root, {model: modelObject})

  it('should init current',  () => {
    const els = root.querySelectorAll('li')
    expect(els[0].innerHTML).to.equal('1 | 0 | 3')
    expect(els[1].innerHTML).to.equal('2 | 1 | 3')
    expect(els[2].innerHTML).to.equal('3 | 2 | 3')
    expect(els[3]).to.equal(undefined)
  })

  it('sync model change', done => {
    vm.path('a').update('$push', 4)
    vm.nextTick(function () {
      const els = root.querySelectorAll('li')
      expect(els[0].innerHTML).to.equal('1 | 0 | 4')
      expect(els[1].innerHTML).to.equal('2 | 1 | 4')
      expect(els[2].innerHTML).to.equal('3 | 2 | 4')
      expect(els[3].innerHTML).to.equal('4 | 3 | 4')
      done()
    })
  })
})