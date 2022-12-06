import { Merge } from './merge.types'

function areSameByReference<T>(oldState: unknown, newState: T): oldState is T {
  return oldState === newState
}

function oldIsNewType<N>(_oldState: unknown, keepOld: boolean): _oldState is N {
  return keepOld
}

function blend<O, N, R extends boolean>(oldState: O, newState: N, reReferenceOnly: R): R extends true ? N : Merge<O, N>

function blend<O, N>(oldState: O, newState: N, reReferenceOnly = false): N | Merge<O, N> {
  if (areSameByReference(oldState, newState)) return oldState

  if (
    typeof oldState !== typeof newState
    || Array.isArray(oldState) !== Array.isArray(newState)
    || typeof newState !== 'object'
    || oldState === null
    || newState === null
    || oldState === undefined
    || newState === undefined
  ) {
    return newState
  }

  const shouldReReferenceOnly = reReferenceOnly || Array.isArray(newState)

  const oldStateKeysList: (keyof O)[] = Object.keys(oldState) as (keyof O)[]
  const oldStateKeysSet: Set<keyof O> = new Set(oldStateKeysList)
  const newStateKeysList: (keyof N)[] = Object.keys(newState) as (keyof N)[]
  const newStateKeysSet: Set<keyof N> = new Set(newStateKeysList)

  const droppedKeys: Set<keyof O> = new Set(
    oldStateKeysList.filter(key => !newStateKeysSet.has(key as unknown as keyof N)),
  )
  const carriedOverKeys: Set<keyof N & keyof O> = new Set(
    newStateKeysList.filter(key => oldStateKeysSet.has(key as unknown as keyof O)) as (keyof N & keyof O)[],
  )
  const newKeys: Set<keyof N> = new Set(
    newStateKeysList.filter(key => !oldStateKeysSet.has(key as unknown as keyof O)),
  )

  const constructedState: any = (Array.isArray(newState) ? [] : {})
  let keepOld = droppedKeys.size === 0

  if (!shouldReReferenceOnly) {
    for (const droppedKey of droppedKeys) {
      constructedState[droppedKey] = oldState[droppedKey]
    }
  }

  for (const carriedOverKey of carriedOverKeys) {
    constructedState[carriedOverKey] = blend(oldState[carriedOverKey], newState[carriedOverKey], shouldReReferenceOnly)
    if (!areSameByReference(constructedState[carriedOverKey], oldState[carriedOverKey])) {
      keepOld = false
    }
  }

  for (const newKey of newKeys) {
    constructedState[newKey] = newState[newKey]
    keepOld = false
  }

  if (oldIsNewType<N>(oldState, keepOld)) {
    return oldState
  }
  return constructedState
}

export const reReference = <O, N>(oldState: O, newState: N): N => blend(oldState, newState, true)
export const merge = <O, N>(oldState: O, newState: N): Merge<O, N> => blend(oldState, newState, false)
