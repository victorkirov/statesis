import * as _ from 'lodash'

export function blend (oldState, newState) {
  if(oldState === newState) return oldState

  if(typeof oldState !== 'object'
    || oldState === null
    || typeof newState !== 'object'
    || newState === null) return newState

  const oldStateKeys = {}
  _.map(oldState, (property, key) => {
    oldStateKeys[key] = {
      type: typeof property,
      value: property,
      touched: false
    }
  })

  const constructedState = {}
  let returnConstructed = false
  let keepOld = true

  _.map(newState, (property, key) => {
    if(oldStateKeys[key]){
      const oldDef = oldStateKeys[key]
      oldDef.touched = true

      constructedState[key] = blend(oldDef.value, property)
      if(constructedState[key] !== oldDef.value) keepOld = false
      else if(constructedState[key] !== property) returnConstructed = true
    } else{
      constructedState[key] = property
      keepOld = false
    }
  })

  if(keepOld && _.every(oldStateKeys, (keyItem) => keyItem.touched)) return oldState
  if(returnConstructed) return constructedState
  return newState
}
