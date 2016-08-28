describe('formatter-common', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <div id="formatter-common">
      <span class="string">\${string | string(16)}</span>
      <span class="count">\${count | count}</span>
      <span class="count2">\${count2 | count}</span>
      <span class="empty">\${empty | empty}</span>
      <span class="empty2">\${empty2 | empty}</span>
      <span class="unempty">\${empty | !empty}</span>
      <span class="unempty2">\${empty2 | !empty}</span>

      <span class="lt">\${number | < 4}</span>
      <span class="lt2">\${number | < 5}</span>
      <span class="lt3">\${number | < 6}</span>

      <span class="lteq">\${number | <= 4}</span>
      <span class="lteq2">\${number | <= 5}</span>
      <span class="lteq3">\${number | <= 6}</span>

      <span class="eq">\${number | == 4}</span>
      <span class="eq2">\${number | == 5}</span>
      <span class="eq3">\${number | == 6}</span>

      <span class="gteq">\${number | >= 4}</span>
      <span class="gteq2">\${number | >= 5}</span>
      <span class="gteq3">\${number | >= 6}</span>

      <span class="gt">\${number | > 4}</span>
      <span class="gt2">\${number | > 5}</span>
      <span class="gt3">\${number | > 6}</span>

      <span class="noeq">\${number | != 4}</span>
      <span class="noeq2">\${number | != 5}</span>
      <span class="noeq3">\${number | != 6}</span>

      <span class="default">\${number | ?? 6}</span>
      <span class="default2">\${undefined | ?? 6}</span>
    </div>
  `
  const modelObject = {
    string: 10,
    count: [1, 2, 3],
    count2: {'1':1, '2':3, '3':3},
    empty: [],
    empty2: {},
    number: 5,
    undefined: undefined
  }
  const root = document.getElementById('formatter-common')
  const vm = Akatsuki(root, {model: modelObject})


  it('should formatter "string" current',  () => {
    const el = root.querySelector('.string')
    expect(el.innerHTML).to.equal('a')
  })

  it('should formatter "count" array current',  () => {
    const el = root.querySelector('.count')
    expect(el.innerHTML).to.equal('3')
  })

  it('should formatter "count" object current',  () => {
    const el = root.querySelector('.count2')
    expect(el.innerHTML).to.equal('3')
  })

  it('should formatter "empty" array current', () => {
    const el = root.querySelector('.empty')
    expect(el.innerHTML).to.equal('true')
  })

  it('should formatter "empty" object current', () => {
    const el = root.querySelector('.empty2')
    expect(el.innerHTML).to.equal('true')
  })

  it('should formatter "!empty" array current', () => {
    const el = root.querySelector('.unempty')
    expect(el.innerHTML).to.equal('false')
  })

  it('should formatter "!empty" object current', () => {
    const el = root.querySelector('.unempty2')
    expect(el.innerHTML).to.equal('false')
  })

  it('should formatter "<" current', () => {
    let el = root.querySelector('.lt')
    expect(el.innerHTML).to.equal('false')
    el = root.querySelector('.lt2')
    expect(el.innerHTML).to.equal('false')
    el = root.querySelector('.lt3')
    expect(el.innerHTML).to.equal('true')
  })

  it('should formatter "<=" current', () => {
    let el = root.querySelector('.lteq')
    expect(el.innerHTML).to.equal('false')
    el = root.querySelector('.lteq2')
    expect(el.innerHTML).to.equal('true')
    el = root.querySelector('.lteq3')
    expect(el.innerHTML).to.equal('true')
  })

  it('should formatter "==" current', () => {
    let el = root.querySelector('.eq')
    expect(el.innerHTML).to.equal('false')
    el = root.querySelector('.eq2')
    expect(el.innerHTML).to.equal('true')
    el = root.querySelector('.eq3')
    expect(el.innerHTML).to.equal('false')
  })

  it('should formatter ">=" current', () => {
    let el = root.querySelector('.gteq')
    expect(el.innerHTML).to.equal('true')
    el = root.querySelector('.gteq2')
    expect(el.innerHTML).to.equal('true')
    el = root.querySelector('.gteq3')
    expect(el.innerHTML).to.equal('false')
  })

  it('should formatter ">" current', () => {
    let el = root.querySelector('.gt')
    expect(el.innerHTML).to.equal('true')
    el = root.querySelector('.gt2')
    expect(el.innerHTML).to.equal('false')
    el = root.querySelector('.gt3')
    expect(el.innerHTML).to.equal('false')
  })

  it('should formatter "!=" current', () => {
    let el = root.querySelector('.noeq')
    expect(el.innerHTML).to.equal('true')
    el = root.querySelector('.noeq2')
    expect(el.innerHTML).to.equal('false')
    el = root.querySelector('.noeq3')
    expect(el.innerHTML).to.equal('true')
  })

  it('should formatter "??" current', () => {
    let el = root.querySelector('.default')
    expect(el.innerHTML).to.equal('5')
    el = root.querySelector('.default2')
    expect(el.innerHTML).to.equal('6')
  })
})