import * as utils from '../src/utils'

describe('utils', () => {

  it('getType current', () => {
    expect(utils.getType('')).to.equal('string')
    expect(utils.getType([])).to.equal('array')
    expect(utils.getType({})).to.equal('object')
    expect(utils.getType(1)).to.equal('number')
    expect(utils.getType(true)).to.equal('boolean')
  })

  it('objforeah current', () => {
    expect(utils.objForeach({1: 'a',2: 'b',3: 'c'}, (item, key) => item + key))
      .to.deep.equal({1: 'a1', 2: 'b2', 3: 'c3'})
  })

  it('objectValueFromPath current', () => {
    const obj = {a: {b : {c: 1}}}
    expect(utils.objectValueFromPath(obj, 'a.b.c')).to.equal(1)
  })

  it('camelize current', () => {
    expect(utils.camelize('good-day')).to.equal('goodDay')
  })

  it('pathToObject current', () => {
    const obj = {a: {b : {c: 1}}}
    expect(utils.pathToObject('a.b.c', 1)).to.deep.equal(obj)
  })

  it('deepCopy current', () => {
    const obj = {a: {b : {c: 1}}}
    expect(utils.deepCopy(obj)).to.deep.equal(obj)
    expect(utils.deepCopy(obj)).to.not.equal(obj)
  })

  it('nextTick current', (done) => {
    utils.nextTick( () => done() )
  })

})