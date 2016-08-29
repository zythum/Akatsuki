describe('operation-array', () => {

  const model = new Akatsuki.Model({array: [1]})
  const array = model.path('array')

  it('should formatter "$push" current',  () => {
    array.update('$push', 2)
    expect(array.get()).to.deep.equal([1, 2])
  })

  it('should formatter "$pop" current',  () => {
    array.update('$pop')
    expect(array.get()).to.deep.equal([1])
  })

  it('should formatter "$unshift" current',  () => {
    array.update('$unshift', 0)
    expect(array.get()).to.deep.equal([0, 1])
  })

  it('should formatter "$shift" current',  () => {
    array.update('$shift')
    expect(array.get()).to.deep.equal([1])
  })

  it('should formatter "$arraySlice" current',  () => {
    array.update('$arraySlice', [1])
    expect(array.get()).to.deep.equal([])
  })

  it('should formatter "$splice" current', () => {
    array.update('$splice', [0, 0, 1, 2, 3])
    expect(array.get()).to.deep.equal([1, 2, 3])
  })

  it('should formatter "$reverse" current', () => {
    array.update('$reverse')
    expect(array.get()).to.deep.equal([3, 2, 1])
  })

  it('should formatter "$sort" current', () => {
    array.update('$sort', (a, b) => a - b)
    expect(array.get()).to.deep.equal([1, 2, 3])
  })

  it('should formatter "$filter" current', () => {
    array.update('$filter', (n) => n % 2 === 1)
    expect(array.get()).to.deep.equal([1, 3])
  })

  it('should formatter "$map" current', () => {
    array.update('$map', (n) => n + 1)
    expect(array.get()).to.deep.equal([2, 4])
  })

  it('should formatter "$remove" current', () => {
    array.update('$remove', 1)
    expect(array.get()).to.deep.equal([2])
  })
})