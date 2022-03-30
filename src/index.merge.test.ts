import { merge } from './index'

describe('merge', () => {
  describe('primitive type as new value', () => {
    test.each([
      1,
      'a',
      true,
      { a: 1 },
      [4, 5],
      null,
      undefined,
    ])('%s should be overwritten', input => {
      expect(merge(input, 1)).toEqual(1)
      expect(merge(input, 'r')).toEqual('r')
      expect(merge(input, true)).toEqual(true)
      expect(merge(input, null)).toEqual(null)
      expect(merge(input, undefined)).toEqual(undefined)
    })
  })

  describe('object as new value, old value not object', () => {
    test.each([
      1,
      'a',
      true,
      null,
      undefined,
      [1, 2, 3, 4],
    ])('%s should be overwritten', input => {
      expect(merge(input, { a: 1, b: [1, 2] })).toEqual({ a: 1, b: [1, 2] })
      expect(merge(input, { '0': 'hi' })).toEqual({ '0': 'hi' })
    })
  })

  describe('list as new value, old value not list', () => {
    test.each([
      1,
      'a',
      true,
      null,
      undefined,
      { '0': 1, bob: 2 },
    ])('%s should be overwritten', input => {
      expect(merge(input, [0, 1, 2, 3])).toEqual([0, 1, 2, 3])
      expect(merge(input, ['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
      expect(merge(input, [1, 'b', null, undefined])).toEqual([1, 'b', null, undefined])
    })
  })

  describe('2 objects', () => {
    describe('merge primitives takes new value', () => {
      test.each([
        [1, 2],
        ['a', 'b'],
        [true, false],
        [null, undefined],
        [undefined, null],
        [4, 'hello'],
        [2, { a:1 }],
        [{ a:1 }, 2],
        ['world', [1, 2, 3]],
        [[1, 2, 3], 'world'],
        [[1, 2, 3], [2]],
      ])('%s should be overwritten', (objectA, objectB) => {
        expect(merge(objectA, objectB)).toEqual(objectB)
      })
    })

    test('should merge', () => {
      expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
    })

    test('merge deep', () => {
      const objectA = { a: { b: 1 } }
      const objectB = { a: { c: 2 } }

      const merged = merge(objectA, objectB)
      expect(merged).toEqual({ a: { b: 1, c: 2 } })
      expect(merged.a).not.toBe(objectA.a)
      expect(merged.a).not.toBe(objectB.a)
    })

    test('merge deeper', () => {
      expect(merge({ a: { b: { c: 1 } } }, { a: { b: { d: 2 } } })).toEqual({ a: { b: { c: 1, d: 2 } } })
    })

    test('merge overwrite', () => {
      expect(merge({ a: 1 }, { a: 2 })).toEqual({ a: 2 })
    })

    test('merge mixed keys', () => {
      expect(merge({ a: 1, b: 2 }, { a: 2, c: 3 })).toEqual({ a: 2, b: 2, c: 3 })
    })

    test('merge with different child types and overwrite', () => {
      expect(merge({ a: 1, b: 'hello', d: true }, { a: [1, 2, 3], c: 'world', d: false }))
        .toEqual({ a: [1, 2, 3], b: 'hello', c: 'world', d: false })
    })

    test('merge keeps references as original objects', () => {
      const objectA = { a: { b: 1 }, z: { y: 2 } }
      const objectB = { c: { d: 2 }, z: { x: 3 } }

      const merged = merge(objectA, objectB)
      expect(merged).toEqual({ a: { b: 1 }, c: { d: 2 }, z: { y: 2, x: 3 } })
      expect(merged.a).toBe(objectA.a)
      expect(merged.c).toBe(objectB.c)
      expect(merged.z).not.toBe(objectB.z)
    })

    test('merge object with undefined field', () => {
      expect(merge({ a: 1, b: 2 }, { b: undefined })).toEqual({ a: 1 })
    })

    test('merge with null field', () => {
      expect(merge({ a: 1, b: 2 }, { b: null })).toEqual({ a: 1, b: null })
    })

    test('merge with list fields does not merge lists', () => {
      expect(merge({ a: 1, b: [2, 3, 4, 5] }, { b: [1, 2, 3] })).toEqual({ a: 1, b: [1, 2, 3] })
    })

    test('merge with object in list updates reference but does not merge object', () => {
      const listA = [{ same: 0 }, { a: 1, b: { a: 2 } }, { c: { d:3 }, e: { f:5 } }, 5, 'remove']
      const listB = [{ same: 0 }, { a: 1, b: { b: 2 } }, { c: { d:3 }, e: { f:6 } }, 6]

      const merged = merge(listA, listB)

      expect(merged).toEqual([{ same: 0 }, { a: 1, b: { b: 2 } }, { c: { d:3 }, e: { f:6 } }, 6])

      expect(merged[0]).toBe(listA[0])

      expect(merged[1]).not.toBe(listA[1])

      expect(merged[2]).not.toBe(listA[2])
      expect(merged[2]).not.toBe(listB[2])
      expect((merged[2] as any).c).toBe((listA[2] as any).c)
      expect((merged[2] as any).e).not.toBe((listA[2] as any).e)
    })
  })
})
