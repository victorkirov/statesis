import { blend } from './index'

describe('#blend primitive type states', function () {
  test('equal strings', function () {
    expect(blend('test', 'test')).toEqual('test')
  })

  test('different strings', function () {
    expect(blend('test', 'test2')).toEqual('test2')
  })

  test('equal numbers', function () {
    expect(blend(5, 5)).toEqual(5)
  })

  test('different numbers', function () {
    expect(blend(5, 6)).toEqual(6)
  })

  test('equal booleans', function () {
    expect(blend(true, true)).toEqual(true)
  })

  test('different booleans', function () {
    expect(blend(true, false)).toEqual(false)
  })

  test('equal undefined', function () {
    expect(blend(undefined, undefined)).toBeUndefined()
  })

  test('undefined and something else', function () {
    expect(blend(undefined, 4)).toEqual(4)
  })

  test('something and undefined', function () {
    expect(blend(4, undefined)).toBeUndefined()
  })

  test('equal nulls', function () {
    expect(blend(null, null)).toEqual(null)
  })

  test('null and something else', function () {
    expect(blend(null, 4)).toEqual(4)
  })

  test('something and null', function () {
    expect(blend(4, null)).toEqual(null)
  })
})


describe('#blend objects with primitive types', function () {
  const state = {}

  test('returns new state if old state is string', function () {
    expect(blend('test', state)).toEqual(state)
  })

  test('returns string if old state is object', function () {
    expect(blend(state, 'test')).toEqual('test')
  })

  test('returns new state if old state is null', function () {
    expect(blend(null, state)).toEqual(state)
  })

  test('returns null if old state is object', function () {
    expect(blend(state, null)).toEqual(null)
  })

  test('returns new state if old state is undefined', function () {
    expect(blend(undefined, state)).toEqual(state)
  })

  test('returns undefined if old state is object', function () {
    expect(blend(state, undefined)).toBeUndefined()
  })
})

describe('#blend objects with primitive properties', function () {
  const oldState = {
    stringData: 'dataItem',
    numberData: 5,
  }

  test('returns old state object if states are equal', function () {
    expect(blend(oldState, oldState)).toEqual(oldState)
  })

  test('returns old state object if state values are equal', function () {
    const newState = { ...oldState }
    expect(blend(oldState, newState)).toEqual(oldState)
  })

  test('returns new state if new state has new field', function () {
    const newState = { ...oldState, newStringData: 'newDataItem' }
    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.stringData).toEqual(oldState.stringData)
    expect(blended.numberData).toEqual(oldState.numberData)
    expect(blended.newStringData).toEqual('newDataItem')
  })

  test('returns new state if new state has changed string value', function () {
    const newState = { ...oldState, stringData: 'newValue' }
    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.numberData).toEqual(oldState.numberData)
    expect(blended.stringData).toEqual('newValue')
  })

  test('returns new state if new state has changed number value', function () {
    const newState = { ...oldState, numberData: 4 }
    const blended = blend(oldState, newState)
    expect(blended.stringData).toEqual(oldState.stringData)
    expect(blended.numberData).toEqual(4)
  })

  test('returns new state without field if new state has missing field', function () {
    const { stringData, ...newState } = oldState
    const blended = blend(oldState, newState)
    expect(blended.numberData).toEqual(oldState.numberData)
    expect('stringData' in blended).toBeFalsy()
  })
})

describe('#blend objects with object properties', function () {
  const oldState = {
    stringData: 'dataItem',
    numberData: 5,
    innerItem: {
      innerString: 'innerDataItem',
      innerNumber: 6,
    },
    otherInnerItem: {
      foo: 'bar',
    },
    nullItem: null,
    undefinedItem: undefined,
  }

  test('returns old state object if states are equal', function () {
    expect(blend(oldState, oldState)).toEqual(oldState)
  })

  test('returns old state object if state values are equal', function () {
    const newState = { ...oldState }
    expect(blend(oldState, newState)).toEqual(oldState)
  })

  test('returns old state object if inner state values are equal', function () {
    const newState = { ...oldState }
    newState.innerItem = { ...oldState.innerItem }
    expect(blend(oldState, newState)).toEqual(oldState)
  })

  test('returns new state object if inner state values are different', function () {
    const newState = { ...oldState }
    newState.innerItem = { ...oldState.innerItem, innerNumber: 7 }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.stringData).toEqual(oldState.stringData)
    expect(blended.numberData).toEqual(oldState.numberData)
    expect(blended.otherInnerItem).toEqual(oldState.otherInnerItem)
    expect(blended.innerItem).not.toEqual(oldState.innerItem)
    expect(blended.innerItem.innerNumber).toEqual(7)
  })

  test('returns new state object if inner state has new field', function () {
    const newState = { ...oldState }
    newState.innerItem = { ...oldState.innerItem, newField: 7 } as any

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.stringData).toEqual(oldState.stringData)
    expect(blended.numberData).toEqual(oldState.numberData)
    expect(blended.otherInnerItem).toEqual(oldState.otherInnerItem)
    expect(blended.innerItem).not.toEqual(oldState.innerItem)
    expect((blended.innerItem  as any).newField).toEqual(7)
    expect(blended.innerItem.innerNumber).toEqual(6)
  })

  test('returns new state object if inner state has removed field', function () {
    const { innerNumber, ...newInnerItem } = oldState.innerItem
    const newState = { ...oldState, innerItem: newInnerItem }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.stringData).toEqual(oldState.stringData)
    expect(blended.numberData).toEqual(oldState.numberData)
    expect(blended.otherInnerItem).toEqual(oldState.otherInnerItem)
    expect(blended.innerItem).not.toEqual(oldState.innerItem)
    expect((blended.innerItem as any).innerNumber).toBeUndefined()
  })

  test(
    'returns newly constructed, blended object if inner state value changed on one object but not other',
    function () {
      const newState = { ...oldState, otherInnerItem: { newFoo: 'newBar' } }
      newState.innerItem = { ...oldState.innerItem }

      const blended = blend(oldState, newState)
      expect(blended).not.toEqual(oldState)
      expect(blended.innerItem).toEqual(oldState.innerItem)
      expect(blended.otherInnerItem).not.toEqual(oldState.otherInnerItem)
    },
  )
})

describe('#blend objects with nested object properties', function () {
  const oldState = {
    stringData: 'dataItem',
    numberData: 5,
    innerItem: {
      innerString: 'innerDataItem',
      innerNumber: 6,
      innerInnerItem: {
        deepString: 'deep',
      },
      otherInnerInnerItem: {
        deepNumber: 10,
        deepString: 'deep',
        deepNull: null,
      },
    },
    otherInnerItem: {
      foo: 'bar',
    },
    nullItem: null,
    undefinedItem: undefined,
  }

  test('returns old state object if states are equal', function () {
    expect(blend(oldState, oldState)).toEqual(oldState)
  })

  test('returns old state object if state values are equal', function () {
    const newState = { ...oldState }
    newState.innerItem = { ...oldState.innerItem }
    newState.innerItem.innerInnerItem = { ...oldState.innerItem.innerInnerItem }

    const blended = blend(oldState, newState)
    expect(blended).toEqual(oldState)
    expect(blended.innerItem).toEqual(oldState.innerItem)
    expect(blended.innerItem.innerInnerItem).toEqual(oldState.innerItem.innerInnerItem)
  })

  test('returns new state object if state values are different', function () {
    const newState = { ...oldState }
    newState.innerItem = { ...oldState.innerItem }
    newState.innerItem.innerInnerItem = { ...oldState.innerItem.innerInnerItem }
    newState.innerItem.innerInnerItem.deepString = 'deep2'
    newState.innerItem.otherInnerInnerItem = { ...oldState.innerItem.otherInnerInnerItem }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.otherInnerItem).toEqual(oldState.otherInnerItem)
    expect(blended.innerItem).not.toEqual(oldState.innerItem)
    expect(blended.innerItem.innerInnerItem).not.toEqual(oldState.innerItem.innerInnerItem)
    expect(blended.innerItem.otherInnerInnerItem).toEqual(oldState.innerItem.otherInnerInnerItem)
  })

  test('returns blended state object if deleted inner object property', function () {
    const { deepString, ...newInnerInnerItem } = oldState.innerItem.innerInnerItem
    const newOtherInnerInnerItem = { ...oldState.innerItem.otherInnerInnerItem }
    const newInnerItem = {
      ...oldState.innerItem,
      otherInnerInnerItem: newOtherInnerInnerItem,
      innerInnerItem: newInnerInnerItem,
    }
    const newState = { ...oldState, innerItem: newInnerItem }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.otherInnerItem).toEqual(oldState.otherInnerItem)
    expect(blended.innerItem).not.toEqual(oldState.innerItem)
    expect(blended.innerItem.innerInnerItem).not.toEqual(oldState.innerItem.innerInnerItem)
    expect(blended.innerItem.otherInnerInnerItem).toEqual(oldState.innerItem.otherInnerInnerItem)
  })
})

describe('#blend objects with array properties', function () {
  const oldState = {
    myArray: ['zero', 1, 2, 3, 4],
  }

  test('returns old state object if states are equal', function () {
    expect(blend(oldState, oldState)).toEqual(oldState)
  })

  test('returns old state object if state values are equal', function () {
    const newState = { ...oldState }
    newState.myArray = [...oldState.myArray]
    expect(blend(oldState, newState)).toEqual(oldState)
  })

  test('returns new state if new state has new field', function () {
    const newState = { ...oldState, newStringData: 'newDataItem' }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.myArray).toEqual(oldState.myArray)
    expect(blended.newStringData).toEqual('newDataItem')
  })

  test('returns new state if new state has added array value', function () {
    const newState = { ...oldState }
    newState.myArray = [...oldState.myArray]
    newState.myArray.push(5)

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.myArray).not.toEqual(oldState.myArray)
    expect(newState.myArray.length).toEqual(6)
  })

  test('returns new state if new state has removed array value', function () {
    const newState = { ...oldState }
    newState.myArray = [...oldState.myArray]
    newState.myArray.pop()

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.myArray).not.toEqual(oldState.myArray)
    expect(newState.myArray.length).toEqual(4)
  })
})

describe('#blend objects with array properties with object values', function () {
  const oldState = {
    myArray: [{ key: 1, dummy: 'removeMe' }, { key: 2 }],
  }

  test('returns old state object if states are equal', function () {
    expect(blend(oldState, oldState)).toEqual(oldState)
  })

  test('returns old state object if state values are equal', function () {
    const newMyArray = [
      { ...oldState.myArray[0] },
      { ...oldState.myArray[1] },
    ]
    const newState = { myArray: newMyArray }
    expect(blend(oldState, newState)).toEqual(oldState)
  })

  test('returns new state if new state has new field', function () {
    const newMyArray = [
      { ...oldState.myArray[0] },
      { ...oldState.myArray[1] },
    ]
    const newState = { myArray: newMyArray, newStringData: 'newDataItem' }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.myArray).toEqual(oldState.myArray)
    expect(blended.newStringData).toEqual('newDataItem')
  })

  test('returns new state if new state has added array value', function () {
    const newMyArray = [
      { ...oldState.myArray[0] },
      { ...oldState.myArray[1] },
      5,
    ]

    const newState = { myArray: newMyArray }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(newState.myArray.length).toEqual(3)
    expect(blended.myArray).not.toEqual(oldState.myArray)
    expect(blended.myArray[0]).toEqual(oldState.myArray[0])
    expect(blended.myArray[1]).toEqual(oldState.myArray[1])
  })

  test('returns new state if new state has removed array value', function () {
    const newMyArray = [
      { ...oldState.myArray[0] },
    ]

    const newState = { myArray: newMyArray }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.myArray).not.toEqual(oldState.myArray)
    expect(blended.myArray.length).toEqual(1)
    expect(blended.myArray[0]).toEqual(oldState.myArray[0])
  })

  test('returns new state if new state has changed array value', function () {
    const newMyArray = [
      { ...oldState.myArray[0] },
      { ...oldState.myArray[1], key: 5 },
    ]
    const newState = { myArray: newMyArray }


    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.myArray).not.toEqual(oldState.myArray)
    expect(blended.myArray.length).toEqual(2)
    expect(blended.myArray[0]).toEqual(oldState.myArray[0])
    expect(blended.myArray[1]).not.toEqual(oldState.myArray[1])
  })

  test('returns new state if new state has array value with new property', function () {
    const newMyArray = [
      { ...oldState.myArray[0] },
      { ...oldState.myArray[1], newDummy: 'hurrdurr' },
    ]
    const newState = { myArray: newMyArray }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.myArray).not.toEqual(oldState.myArray)
    expect(blended.myArray.length).toEqual(2)
    expect(blended.myArray[0]).toEqual(oldState.myArray[0])
    expect(blended.myArray[1]).not.toEqual(oldState.myArray[1])
  })

  test('returns new state if new state has array value with deleted property', function () {
    const newFirstVal = { key: oldState.myArray[0]?.key }
    const newMyArray = [
      newFirstVal,
      { ...oldState.myArray[1] },
    ]
    const newState = { myArray: newMyArray }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.myArray).not.toEqual(oldState.myArray)
    expect(blended.myArray.length).toEqual(2)
    expect(blended.myArray[0]).not.toEqual(oldState.myArray[0])
    expect(blended.myArray[1]).toEqual(oldState.myArray[1])
  })
})

describe('#blend objects with array properties with nested object values', function () {
  const oldState = {
    myArray: [{ innerItem: { key: 1, dummy: 'removeMe' }, otherInnerItem: { key: 2 } }],
  }

  test('returns old state object if states are equal', function () {
    expect(blend(oldState, oldState)).toEqual(oldState)
  })

  test('returns old state object if state values are equal', function () {
    const newState = {
      myArray: [{ innerItem: { key: 1, dummy: 'removeMe' }, otherInnerItem: { key: 2 } }],
    }
    expect(blend(oldState, newState)).toEqual(oldState)
  })

  test('returns new state if new state has changed array value', function () {
    const newState = {
      myArray: [{ innerItem: { key: 5, dummy: 'removeMe' }, otherInnerItem: { key: 2 } }],
    }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.myArray).not.toEqual(oldState.myArray)
    expect(blended.myArray.length).toEqual(1)
    expect(blended.myArray[0]).not.toEqual(oldState.myArray[0])
    expect(blended.myArray[0]?.innerItem).not.toEqual(oldState.myArray[0]?.innerItem)
    expect(blended.myArray[0]?.otherInnerItem).toEqual(oldState.myArray[0]?.otherInnerItem)
  })

  test('returns new state if new state has array value with new property', function () {
    const newState = {
      myArray: [{ innerItem: { key: 5, dummy: 'removeMe', newDummy: 'hurrdurr' }, otherInnerItem: { key: 2 } }],
    }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.myArray).not.toEqual(oldState.myArray)
    expect(blended.myArray.length).toEqual(1)
    expect(blended.myArray[0]).not.toEqual(oldState.myArray[0])
    expect(blended.myArray[0]?.innerItem).not.toEqual(oldState.myArray[0]?.innerItem)
    expect(blended.myArray[0]?.otherInnerItem).toEqual(oldState.myArray[0]?.otherInnerItem)
  })

  test('returns new state if new state has array value with deleted property', function () {
    const newState = {
      myArray: [{ innerItem: { key: 5 }, otherInnerItem: { key: 2 } }],
    }

    const blended = blend(oldState, newState)
    expect(blended).not.toEqual(oldState)
    expect(blended.myArray).not.toEqual(oldState.myArray)
    expect(blended.myArray.length).toEqual(1)
    expect(blended.myArray[0]).not.toEqual(oldState.myArray[0])
    expect(blended.myArray[0]?.innerItem).not.toEqual(oldState.myArray[0]?.innerItem)
    expect(blended.myArray[0]?.otherInnerItem).toEqual(oldState.myArray[0]?.otherInnerItem)
  })
})

describe('#value changes from list to object', function () {
  const oldState = {
    innerList: [1, 2],
    innerObject: {
      '0': 1,
    },
  }

  test('returns old state object if states are equal', function () {
    expect(blend(oldState, oldState)).toEqual(oldState)
  })

  test('returns old state object if state values are equal', function () {
    const newState = {
      ...oldState,
      innerList: [...oldState.innerList],
      innerObject: { ...oldState.innerObject },
    }
    expect(blend(oldState, newState)).toEqual(oldState)
  })

  test('returns new state if list changes to object', function () {
    const newState = { ...oldState, innerList: { '0': 1, '1': 2 } }

    expect(blend(oldState, newState)).toEqual(newState)
  })

  test('returns new state if object changes to list', function () {
    const newState = { ...oldState, innerObject: [1] }

    expect(blend(oldState, newState)).toEqual(newState)
  })
})
