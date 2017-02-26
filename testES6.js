import {blend} from './lib'
import {should, assert} from 'chai'

should()

// Primitive types tests
describe('#blend primitive type states', function() {
  it('equal strings', function() {
    blend('test', 'test').should.equal('test')
  })

  it('different strings', function() {
    blend('test', 'test2').should.equal('test2')
  })

  it('equal numbers', function() {
    blend(5, 5).should.equal(5)
  })

  it('different numbers', function() {
    blend(5, 6).should.equal(6)
  })

  it('equal bools', function() {
    blend(true, true).should.equal(true)
  })

  it('different bools', function() {
    blend(true, false).should.equal(false)
  })

  it('equal undefined', function() {
    const newState = blend(undefined, undefined)
    assert.equal(newState, undefined)
  })

  it('undefined and something else', function() {
    blend(undefined, 4).should.equal(4)
  })

  it('something and undefined', function() {
    const newState = blend(4, undefined)
    assert.equal(newState, undefined)
  })

  it('equal nulls', function() {
    const newState = blend(null, null)
    assert.equal(newState, null)
  })

  it('null and something else', function() {
    blend(null, 4).should.equal(4)
  })

  it('something and null', function() {
    const newState = blend(4, null)
    assert.equal(newState, null)
  })
})

// Primitive types and objects
describe('#blend objects with primitive types', function() {
  const state = {}

  it('returns new state if old state is string', function() {
    blend('test', state).should.equal(state)
  })

  it('returns string if old state is object', function() {
    blend(state, 'test').should.equal('test')
  })

  it('returns new state if old state is null', function() {
    blend(null, state).should.equal(state)
  })

  it('returns null if old state is object', function() {
    const newState = blend(state, null)
    assert.equal(newState, null)
  })

  it('returns new state if old state is undefined', function() {
    blend(undefined, state).should.equal(state)
  })

  it('returns undefined if old state is object', function() {
    const newState = blend(state, undefined)
    assert.equal(newState, undefined)
  })
})

// Objects with primitive types only
describe('#blend objects with primitive types', function() {
  const oldState = {
      stringData: 'dataItem',
      numberData: 5
    }

  it('returns old state object if states are equal', function() {
    blend(oldState, oldState).should.equal(oldState)
  })

  it('returns old state object if state values are equal', function() {
    const newState = {...oldState}
    blend(oldState, newState).should.equal(oldState)
  })

  it('returns new object if new state has new field', function() {
    const newState = {...oldState, newStringData: 'newDataItem'}
    blend(oldState, newState).should.equal(newState)
  })

  it('returns new object if new state has changed string value', function() {
    const newState = {...oldState, stringData: 'newValue'}
    blend(oldState, newState).should.equal(newState)
  })

  it('returns new object if new state has changed number value', function() {
    const newState = {...oldState, numberData: 4}
    blend(oldState, newState).should.equal(newState)
  })

  it('returns blended object without field if new state has missing field', function() {
    const newState = {...oldState}
    blend(oldState, newState).should.equal(newState)
  })
})
