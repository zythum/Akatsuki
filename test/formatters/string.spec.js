describe('formatter-string', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <div id="formatter-string">
      <span class="replace">\${string | replace('abc', 'def')}</span>
      <span class="substr">\${string | substr(2,3)}</span>
      <span class="substring">\${string | substring(2,3)}</span>
      <span class="slice">\${string | slice(1,-1)}</span>
      <span class="trim">\${string | trim}</span>
      <span class="trimLeft">\${string | trimLeft}</span>
      <span class="trimRight">\${string | trimRight}</span>
      <span class="prefix">\${string | prefix '111'}</span>
      <span class="suffix">\${string | suffix '111'}</span>
    </div>
  `
  const modelObject = {
    string: ' abcdefg ',
  }
  const root = document.getElementById('formatter-string')
  const vm = Akatsuki(root, {model: modelObject})


  it('should formatter "replace" current',  () => {
    const el = root.querySelector('.replace')
    expect(el.innerHTML).to.equal(' defdefg ')
  })

  it('should formatter "substr" current',  () => {
    const el = root.querySelector('.substr')
    expect(el.innerHTML).to.equal('bcd')
  })

  it('should formatter "substring" current',  () => {
    const el = root.querySelector('.substring')
    expect(el.innerHTML).to.equal('b')
  })

  it('should formatter "slice" current',  () => {
    const el = root.querySelector('.slice')
    expect(el.innerHTML).to.equal('abcdefg')
  })

  it('should formatter "trim" current',  () => {
    const el = root.querySelector('.trim')
    expect(el.innerHTML).to.equal('abcdefg')
  })

  it('should formatter "trimLeft" current',  () => {
    const el = root.querySelector('.trimLeft')
    expect(el.innerHTML).to.equal('abcdefg ')
  })

  it('should formatter "trimRight" current',  () => {
    const el = root.querySelector('.trimRight')
    expect(el.innerHTML).to.equal(' abcdefg')
  })

  it('should formatter "prefix" current',  () => {
    const el = root.querySelector('.prefix')
    expect(el.innerHTML).to.equal('111 abcdefg ')
  })

  it('should formatter "suffix" current',  () => {
    const el = root.querySelector('.suffix')
    expect(el.innerHTML).to.equal(' abcdefg 111')
  })
})