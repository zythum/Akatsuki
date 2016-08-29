describe('operation-number', () => {

  const model = new Akatsuki.Model({number: 6})
  const number = model.path('number')

  it('should formatter "$+" current',  () => {
    number.update('$+', 1)
    expect(number.get()).to.equal(7)
  })

  it('should formatter "$-" current',  () => {
    number.update('$-', 1)
    expect(number.get()).to.equal(6)
  })

  it('should formatter "$*" current',  () => {
    number.update('$*', 2)
    expect(number.get()).to.equal(12)
  })

  it('should formatter "$/" current',  () => {
    number.update('$/', 2)
    expect(number.get()).to.equal(6)
  })

  it('should formatter "$%" current',  () => {
    number.update('$%', 4)
    expect(number.get()).to.equal(2)
  })

  it('should formatter "$-x" current',  () => {
    number.update('$-x', 12)
    expect(number.get()).to.equal(10)
  })

  it('should formatter "$/x" current',  () => {
    number.update('$/x', 50)
    expect(number.get()).to.equal(5)
  })

  it('should formatter "$%x" current',  () => {
    number.update('$%x', 11)
    expect(number.get()).to.equal(1)
  })

})