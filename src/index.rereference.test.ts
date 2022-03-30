import { reReference } from './index'

describe('reReference', () => {
  describe('primitive type states', function () {
    test('equal strings', function () {
      expect(reReference('test', 'test')).toBe('test')
    })

    test('different strings', function () {
      expect(reReference('test', 'test2')).toBe('test2')
    })

    test('equal numbers', function () {
      expect(reReference(5, 5)).toBe(5)
    })

    test('different numbers', function () {
      expect(reReference(5, 6)).toBe(6)
    })

    test('equal booleans', function () {
      expect(reReference(true, true)).toBe(true)
    })

    test('different booleans', function () {
      expect(reReference(true, false)).toBe(false)
    })

    test('equal undefined', function () {
      expect(reReference(undefined, undefined)).toBeUndefined()
    })

    test('undefined and something else', function () {
      expect(reReference(undefined, 4)).toBe(4)
    })

    test('something and undefined', function () {
      expect(reReference(4, undefined)).toBeUndefined()
    })

    test('equal nulls', function () {
      expect(reReference(null, null)).toBe(null)
    })

    test('null and something else', function () {
      expect(reReference(null, 4)).toBe(4)
    })

    test('something and null', function () {
      expect(reReference(4, null)).toBe(null)
    })
  })


  describe('objects with primitive types', function () {
    const state = {}

    test('returns new state if old state is string', function () {
      expect(reReference('test', state)).toBe(state)
    })

    test('returns string if old state is object', function () {
      expect(reReference(state, 'test')).toBe('test')
    })

    test('returns new state if old state is null', function () {
      expect(reReference(null, state)).toBe(state)
    })

    test('returns null if old state is object', function () {
      expect(reReference(state, null)).toBe(null)
    })

    test('returns new state if old state is undefined', function () {
      expect(reReference(undefined, state)).toBe(state)
    })

    test('returns undefined if old state is object', function () {
      expect(reReference(state, undefined)).toBeUndefined()
    })
  })

  describe('objects with primitive properties', function () {
    const oldState = {
      stringData: 'dataItem',
      numberData: 5,
    }

    test('returns old state object if states are equal', function () {
      expect(reReference(oldState, oldState)).toBe(oldState)
    })

    test('returns old state object if state values are equal', function () {
      const newState = { ...oldState }
      expect(reReference(oldState, newState)).toBe(oldState)
    })

    test('returns new state if new state has new field', function () {
      const newState = { ...oldState, newStringData: 'newDataItem' }
      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.stringData).toBe(oldState.stringData)
      expect(reReferenced.numberData).toBe(oldState.numberData)
      expect(reReferenced.newStringData).toBe('newDataItem')
    })

    test('returns new state if new state has changed string value', function () {
      const newState = { ...oldState, stringData: 'newValue' }
      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.numberData).toBe(oldState.numberData)
      expect(reReferenced.stringData).toBe('newValue')
    })

    test('returns new state if new state has changed number value', function () {
      const newState = { ...oldState, numberData: 4 }
      const reReferenced = reReference(oldState, newState)
      expect(reReferenced.stringData).toBe(oldState.stringData)
      expect(reReferenced.numberData).toBe(4)
    })

    test('returns new state without field if new state has missing field', function () {
      const { stringData, ...newState } = oldState
      const reReferenced = reReference(oldState, newState)
      expect(reReferenced.numberData).toBe(oldState.numberData)
      expect('stringData' in reReferenced).toBeFalsy()
    })
  })

  describe('objects with object properties', function () {
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
      expect(reReference(oldState, oldState)).toBe(oldState)
    })

    test('returns old state object if state values are equal', function () {
      const newState = { ...oldState }
      expect(reReference(oldState, newState)).toBe(oldState)
    })

    test('returns old state object if inner state values are equal', function () {
      const newState = { ...oldState }
      newState.innerItem = { ...oldState.innerItem }
      expect(reReference(oldState, newState)).toBe(oldState)
    })

    test('returns new state object if inner state values are different', function () {
      const newState = { ...oldState }
      newState.innerItem = { ...oldState.innerItem, innerNumber: 7 }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.stringData).toBe(oldState.stringData)
      expect(reReferenced.numberData).toBe(oldState.numberData)
      expect(reReferenced.otherInnerItem).toBe(oldState.otherInnerItem)
      expect(reReferenced.innerItem).not.toEqual(oldState.innerItem)
      expect(reReferenced.innerItem.innerNumber).toBe(7)
    })

    test('returns new state object if inner state has new field', function () {
      const newState = { ...oldState }
      newState.innerItem = { ...oldState.innerItem, newField: 7 } as any

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.stringData).toBe(oldState.stringData)
      expect(reReferenced.numberData).toBe(oldState.numberData)
      expect(reReferenced.otherInnerItem).toBe(oldState.otherInnerItem)
      expect(reReferenced.innerItem).not.toEqual(oldState.innerItem)
      expect((reReferenced.innerItem  as any).newField).toBe(7)
      expect(reReferenced.innerItem.innerNumber).toBe(6)
    })

    test('returns new state object if inner state has removed field', function () {
      const { innerNumber, ...newInnerItem } = oldState.innerItem
      const newState = { ...oldState, innerItem: newInnerItem }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.stringData).toBe(oldState.stringData)
      expect(reReferenced.numberData).toBe(oldState.numberData)
      expect(reReferenced.otherInnerItem).toBe(oldState.otherInnerItem)
      expect(reReferenced.innerItem).not.toEqual(oldState.innerItem)
      expect((reReferenced.innerItem as any).innerNumber).toBeUndefined()
    })

    test(
      'returns newly constructed, reReferenced object if inner state value changed on one object but not other',
      function () {
        const newState = { ...oldState, otherInnerItem: { newFoo: 'newBar' } }
        newState.innerItem = { ...oldState.innerItem }

        const reReferenced = reReference(oldState, newState)
        expect(reReferenced).not.toEqual(oldState)
        expect(reReferenced.innerItem).toBe(oldState.innerItem)
        expect(reReferenced.otherInnerItem).not.toEqual(oldState.otherInnerItem)
      },
    )
  })

  describe('objects with nested object properties', function () {
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
      expect(reReference(oldState, oldState)).toBe(oldState)
    })

    test('returns old state object if state values are equal', function () {
      const newState = { ...oldState }
      newState.innerItem = { ...oldState.innerItem }
      newState.innerItem.innerInnerItem = { ...oldState.innerItem.innerInnerItem }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).toBe(oldState)
      expect(reReferenced.innerItem).toBe(oldState.innerItem)
      expect(reReferenced.innerItem.innerInnerItem).toBe(oldState.innerItem.innerInnerItem)
    })

    test('returns new state object if state values are different', function () {
      const newState = { ...oldState }
      newState.innerItem = { ...oldState.innerItem }
      newState.innerItem.innerInnerItem = { ...oldState.innerItem.innerInnerItem }
      newState.innerItem.innerInnerItem.deepString = 'deep2'
      newState.innerItem.otherInnerInnerItem = { ...oldState.innerItem.otherInnerInnerItem }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.otherInnerItem).toBe(oldState.otherInnerItem)
      expect(reReferenced.innerItem).not.toEqual(oldState.innerItem)
      expect(reReferenced.innerItem.innerInnerItem).not.toEqual(oldState.innerItem.innerInnerItem)
      expect(reReferenced.innerItem.otherInnerInnerItem).toBe(oldState.innerItem.otherInnerInnerItem)
    })

    test('returns reReferenced state object if deleted inner object property', function () {
      const { deepString, ...newInnerInnerItem } = oldState.innerItem.innerInnerItem
      const newOtherInnerInnerItem = { ...oldState.innerItem.otherInnerInnerItem }
      const newInnerItem = {
        ...oldState.innerItem,
        otherInnerInnerItem: newOtherInnerInnerItem,
        innerInnerItem: newInnerInnerItem,
      }
      const newState = { ...oldState, innerItem: newInnerItem }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.otherInnerItem).toBe(oldState.otherInnerItem)
      expect(reReferenced.innerItem).not.toEqual(oldState.innerItem)
      expect(reReferenced.innerItem.innerInnerItem).not.toEqual(oldState.innerItem.innerInnerItem)
      expect(reReferenced.innerItem.otherInnerInnerItem).toBe(oldState.innerItem.otherInnerInnerItem)
    })
  })

  describe('objects with array properties', function () {
    const oldState = {
      myArray: ['zero', 1, 2, 3, 4],
    }

    test('returns old state object if states are equal', function () {
      expect(reReference(oldState, oldState)).toBe(oldState)
    })

    test('returns old state object if state values are equal', function () {
      const newState = { ...oldState }
      newState.myArray = [...oldState.myArray]
      expect(reReference(oldState, newState)).toBe(oldState)
    })

    test('returns new state if new state has new field', function () {
      const newState = { ...oldState, newStringData: 'newDataItem' }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.myArray).toBe(oldState.myArray)
      expect(reReferenced.newStringData).toBe('newDataItem')
    })

    test('returns new state if new state has added array value', function () {
      const newState = { ...oldState }
      newState.myArray = [...oldState.myArray]
      newState.myArray.push(5)

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.myArray).not.toEqual(oldState.myArray)
      expect(newState.myArray.length).toBe(6)
    })

    test('returns new state if new state has removed array value', function () {
      const newState = { ...oldState }
      newState.myArray = [...oldState.myArray]
      newState.myArray.pop()

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.myArray).not.toEqual(oldState.myArray)
      expect(newState.myArray.length).toBe(4)
    })
  })

  describe('objects with array properties with object values', function () {
    const oldState = {
      myArray: [{ key: 1, dummy: 'removeMe' }, { key: 2 }],
    }

    test('returns old state object if states are equal', function () {
      expect(reReference(oldState, oldState)).toBe(oldState)
    })

    test('returns old state object if state values are equal', function () {
      const newMyArray = [
        { ...oldState.myArray[0] },
        { ...oldState.myArray[1] },
      ]
      const newState = { myArray: newMyArray }
      expect(reReference(oldState, newState)).toBe(oldState)
    })

    test('returns new state if new state has new field', function () {
      const newMyArray = [
        { ...oldState.myArray[0] },
        { ...oldState.myArray[1] },
      ]
      const newState = { myArray: newMyArray, newStringData: 'newDataItem' }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.myArray).toBe(oldState.myArray)
      expect(reReferenced.newStringData).toBe('newDataItem')
    })

    test('returns new state if new state has added array value', function () {
      const newMyArray = [
        { ...oldState.myArray[0] },
        { ...oldState.myArray[1] },
        5,
      ]

      const newState = { myArray: newMyArray }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(newState.myArray.length).toBe(3)
      expect(reReferenced.myArray).not.toEqual(oldState.myArray)
      expect(reReferenced.myArray[0]).toBe(oldState.myArray[0])
      expect(reReferenced.myArray[1]).toBe(oldState.myArray[1])
    })

    test('returns new state if new state has removed array value', function () {
      const newMyArray = [
        { ...oldState.myArray[0] },
      ]

      const newState = { myArray: newMyArray }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.myArray).not.toEqual(oldState.myArray)
      expect(reReferenced.myArray.length).toBe(1)
      expect(reReferenced.myArray[0]).toBe(oldState.myArray[0])
    })

    test('returns new state if new state has changed array value', function () {
      const newMyArray = [
        { ...oldState.myArray[0] },
        { ...oldState.myArray[1], key: 5 },
      ]
      const newState = { myArray: newMyArray }


      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.myArray).not.toEqual(oldState.myArray)
      expect(reReferenced.myArray.length).toBe(2)
      expect(reReferenced.myArray[0]).toBe(oldState.myArray[0])
      expect(reReferenced.myArray[1]).not.toEqual(oldState.myArray[1])
    })

    test('returns new state if new state has array value with new property', function () {
      const newMyArray = [
        { ...oldState.myArray[0] },
        { ...oldState.myArray[1], newDummy: 'hurrdurr' },
      ]
      const newState = { myArray: newMyArray }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.myArray).not.toEqual(oldState.myArray)
      expect(reReferenced.myArray.length).toBe(2)
      expect(reReferenced.myArray[0]).toBe(oldState.myArray[0])
      expect(reReferenced.myArray[1]).not.toEqual(oldState.myArray[1])
    })

    test('returns new state if new state has array value with deleted property', function () {
      const newFirstVal = { key: oldState.myArray[0]?.key }
      const newMyArray = [
        newFirstVal,
        { ...oldState.myArray[1] },
      ]
      const newState = { myArray: newMyArray }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.myArray).not.toEqual(oldState.myArray)
      expect(reReferenced.myArray.length).toBe(2)
      expect(reReferenced.myArray[0]).not.toEqual(oldState.myArray[0])
      expect(reReferenced.myArray[1]).toBe(oldState.myArray[1])
    })
  })

  describe('objects with array properties with nested object values', function () {
    const oldState = {
      myArray: [{ innerItem: { key: 1, dummy: 'removeMe' }, otherInnerItem: { key: 2 } }],
    }

    test('returns old state object if states are equal', function () {
      expect(reReference(oldState, oldState)).toBe(oldState)
    })

    test('returns old state object if state values are equal', function () {
      const newState = {
        myArray: [{ innerItem: { key: 1, dummy: 'removeMe' }, otherInnerItem: { key: 2 } }],
      }
      expect(reReference(oldState, newState)).toBe(oldState)
    })

    test('returns new state if new state has changed array value', function () {
      const newState = {
        myArray: [{ innerItem: { key: 5, dummy: 'removeMe' }, otherInnerItem: { key: 2 } }],
      }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.myArray).not.toEqual(oldState.myArray)
      expect(reReferenced.myArray.length).toBe(1)
      expect(reReferenced.myArray[0]).not.toEqual(oldState.myArray[0])
      expect(reReferenced.myArray[0]?.innerItem).not.toEqual(oldState.myArray[0]?.innerItem)
      expect(reReferenced.myArray[0]?.otherInnerItem).toBe(oldState.myArray[0]?.otherInnerItem)
    })

    test('returns new state if new state has array value with new property', function () {
      const newState = {
        myArray: [{ innerItem: { key: 5, dummy: 'removeMe', newDummy: 'hurrdurr' }, otherInnerItem: { key: 2 } }],
      }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.myArray).not.toEqual(oldState.myArray)
      expect(reReferenced.myArray.length).toBe(1)
      expect(reReferenced.myArray[0]).not.toEqual(oldState.myArray[0])
      expect(reReferenced.myArray[0]?.innerItem).not.toEqual(oldState.myArray[0]?.innerItem)
      expect(reReferenced.myArray[0]?.otherInnerItem).toBe(oldState.myArray[0]?.otherInnerItem)
    })

    test('returns new state if new state has array value with deleted property', function () {
      const newState = {
        myArray: [{ innerItem: { key: 5 }, otherInnerItem: { key: 2 } }],
      }

      const reReferenced = reReference(oldState, newState)
      expect(reReferenced).not.toEqual(oldState)
      expect(reReferenced.myArray).not.toEqual(oldState.myArray)
      expect(reReferenced.myArray.length).toBe(1)
      expect(reReferenced.myArray[0]).not.toEqual(oldState.myArray[0])
      expect(reReferenced.myArray[0]?.innerItem).not.toEqual(oldState.myArray[0]?.innerItem)
      expect(reReferenced.myArray[0]?.otherInnerItem).toBe(oldState.myArray[0]?.otherInnerItem)
    })
  })

  describe('value changes from list to object', function () {
    const oldState = {
      innerList: [1, 2],
      innerObject: {
        '0': 1,
      },
    }

    test('returns old state object if states are equal', function () {
      expect(reReference(oldState, oldState)).toBe(oldState)
    })

    test('returns old state object if state values are equal', function () {
      const newState = {
        ...oldState,
        innerList: [...oldState.innerList],
        innerObject: { ...oldState.innerObject },
      }
      expect(reReference(oldState, newState)).toBe(oldState)
    })

    test('returns new state if list changes to object', function () {
      const newState = { ...oldState, innerList: { '0': 1, '1': 2 } }

      expect(reReference(oldState, newState)).toEqual(newState)
    })

    test('returns new state if object changes to list', function () {
      const newState = { ...oldState, innerObject: [1] }

      expect(reReference(oldState, newState)).toEqual(newState)
    })
  })
})
