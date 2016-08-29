describe('operation-bool', () => {

  const model = new Akatsuki.Model({custom: 3})
  const custom = model.path('custom')

  it('should formatter "$exec" current',  () => {
    custom.update('$exec', number => ( number + 3 ) * 4 % 5 - 1)
    expect(custom.get()).to.equal(3)
  })

})