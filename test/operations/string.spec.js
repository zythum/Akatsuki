describe('operation-string', () => {

  const model = new Akatsuki.Model({string: ' abcdef '})
  const string = model.path('string')

  it('should formatter "$replace" current',  () => {
    string.update('$replace', ['abc', 'def'])
    expect(string.get()).to.equal(' defdef ')
  })

  it('should formatter "$substr" current',  () => {
    string.update('$substr', [1, 5])
    expect(string.get()).to.equal('defde')
  })

  it('should formatter "$substring" current',  () => {
    string.update('$substr', [1, 2])
    expect(string.get()).to.equal('ef')
  })

  it('should formatter "$append" current',  () => {
    string.update('$append', '111   ')
    expect(string.get()).to.equal('ef111   ')
  })

  it('should formatter "$append" current',  () => {
    string.update('$prepend', '   222')
    expect(string.get()).to.equal('   222ef111   ')
  })

  it('should formatter "$trimLeft" current',  () => {
    string.update('$trimLeft')
    expect(string.get()).to.equal('222ef111   ')
  })

  it('should formatter "$trimRight" current',  () => {
    string.update('$trimRight')
    expect(string.get()).to.equal('222ef111')
  })

  it('should formatter "$trim" current',  () => {
    string.update('$replace', ['222', '  '])
    string.update('$trim')
    expect(string.get()).to.equal('ef111')
  })
})