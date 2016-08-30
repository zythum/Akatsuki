import * as parser from '../src/parser'

describe('parser', () => {

  it('parseAttributeName current', () => {
    expect(parser.parseAttributeName('[111]', ['[', ']'])).to.equal('111')
    expect(parser.parseAttributeName('[111', ['[', ']'])).to.equal(false)
  })

  it('parseTextTemplate current', ()=> {
    expect(parser.parseTextTemplate('aaa${a.b}bbb', ['${', '}'])).to.deep.equal([
      {type: 'text', value: 'aaa'},
      {type: 'binding', value: 'a.b'},
      {type: 'text', value: 'bbb'}
    ])
  })

  it('parseFunctionCallString current', ()=> {
    expect(parser.parseFunctionCallString('function(arg1, arg2)')).to.deep.equal({
      functionName: 'function',
      args: ['arg1', 'arg2']
    })
  })

  it('parseFunctionCallString2 current', ()=> {
    expect(parser.parseFunctionCallString2('function arg1 arg2')).to.deep.equal({
      functionName: 'function',
      args: ['arg1', 'arg2']
    })
  })

  it('parseDirectiveName current', ()=> {
    expect(parser.parseDirectiveName('class:selected')).to.deep.equal({
      directiveType: 'class',
      args: 'selected'
    })
  })

  it('parseSimpleType_throwError current', ()=> {
    expect(parser.parseSimpleType_throwError('1')).to.equal(1)
    expect(parser.parseSimpleType_throwError('"1"')).to.equal('1')
    expect(parser.parseSimpleType_throwError("'1'")).to.equal('1')
    expect(parser.parseSimpleType_throwError('true')).to.equal(true)
  })

})