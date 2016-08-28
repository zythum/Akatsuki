function pad (number, arg) {
  arg = parseFloat(arg)
  return (Array(arg).join(0) + number).slice(-arg)
}
describe('formatter-number', () => {
  document.body
    .appendChild(document.createElement('div'))
    .innerHTML = `
    <div id="formatter-number">
      <span class="plus">\${number | + 1}</span>
      <span class="minus">\${number | - 1}</span>
      <span class="multiply">\${number | * 2}</span>
      <span class="divide">\${number | \/ 2}</span>
      <span class="remainder">\${number | % 4}</span>
      <span class="minus2">\${number | -x 10}</span>
      <span class="divide2">\${number | \/x 12}</span>
      <span class="remainder2">\${number | %x 7}</span>
      <span class="toFixed">\${toFixed | toFixed 2}</span>
      <span class="pad">\${number | pad 2}</span>
      <span class="date">\${date | date 'yyyy-MM-dd'}</span>
    </div>
  `
  const date = new Date()
  const modelObject = {
    number: 6,
    toFixed: 1.11111,
    date: date.getTime()
  }
  const root = document.getElementById('formatter-number')
  const vm = Akatsuki(root, {model: modelObject})


  it('should formatter "+" current',  () => {
    const el = root.querySelector('.plus')
    expect(el.innerHTML).to.equal('7')
  })

  it('should formatter "-" current',  () => {
    const el = root.querySelector('.minus')
    expect(el.innerHTML).to.equal('5')
  })

  it('should formatter "*" current',  () => {
    const el = root.querySelector('.multiply')
    expect(el.innerHTML).to.equal('12')
  })

  it('should formatter "/" current',  () => {
    const el = root.querySelector('.divide')
    expect(el.innerHTML).to.equal('3')
  })

  it('should formatter "%" current',  () => {
    const el = root.querySelector('.remainder')
    expect(el.innerHTML).to.equal('2')
  })

  it('should formatter "-x" current',  () => {
    const el = root.querySelector('.minus2')
    expect(el.innerHTML).to.equal('4')
  })

  it('should formatter "/x" current',  () => {
    const el = root.querySelector('.divide2')
    expect(el.innerHTML).to.equal('2')
  })

  it('should formatter "%x" current',  () => {
    const el = root.querySelector('.remainder2')
    expect(el.innerHTML).to.equal('1')
  })

  it('should formatter "toFixed" current',  () => {
    const el = root.querySelector('.toFixed')
    expect(el.innerHTML).to.equal('1.11')
  })

  it('should formatter "pad" current',  () => {
    const el = root.querySelector('.pad')
    expect(el.innerHTML).to.equal('06')
  })

  it('should formatter "date" current',  () => {
    const el = root.querySelector('.date')
    expect(el.innerHTML).to.equal(
      `${pad(date.getFullYear(), 4)}-${pad(date.getMonth()+1, 2)}-${pad(date.getDate(), 2)}`
    )
  })
})