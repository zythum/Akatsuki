describe('operation-custom', () => {

  const model = new Akatsuki.Model({bool: false})
  const bool = model.path('bool')

  it('should formatter "$toggle" current',  () => {
    bool.update('$toggle')
    expect(bool.get()).to.equal(true)
    bool.update('$toggle')
    expect(bool.get()).to.equal(false)
  })

})