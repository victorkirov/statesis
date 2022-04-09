# Statesis
An object re-referencer and merger.

## To install
Statesis is available on npm. just run `npm install statesis` to install.

## Usage
Example usage:
```javascript
import { reReference, merge } from 'statesis'

const reReferencedState = reReference(oldState, newState)
const mergedState = merge(oldState, stateUpdates)
```

## Use in React/Redux
Statesis should be used in an environment where a large state could receive a partial state update (e.g. from a websocket), or a new state object is often equal to or very similar to the old but, because of the tools used, it is recreated with completely new references. Statesis allows you to create a new state object re-using the referenced objects from the old state to avoid props changed events from firing.

## Capabilities

Statesis allows you to re-reference an object from an existing object, or to merge updates from a new object into the old while keeping references to the unchanged fields within the object. This is particularly useful where object immutability is required/preferred (e.g. in React).

### reReference

You can use `reReference` to update references in a new state object to those of the old state if they match in a deep compare.

```javascript
import { reReference } from 'statesis'

const oldState = {
  person1: {
    name: 'bob',
    age: 30,
  },
}

const newState = {
  person1: {
    name: 'bob',
    age: 30,
  },
  person2: {
    name: 'cindy',
    age: 27,
  },
}

const reReferencedState = reReference(oldState, newState)

oldState === reReferencedState // false
oldState.person1 === reReferencedState.person1 // true
newState.person1 === reReferencedState.person1 // false
newState.person2 === reReferencedState.person2 // true
```

### merge

You can use `merge` to merge a partial state update into an existing state while keeping the references to unchanged items.

```javascript
import { merge } from 'statesis'

const oldState = {
  person1: {
    name: 'bob',
    age: 30,
  },
  person2: {
    name: 'cindy',
    age: 27,
  },
}

const stateUpdates = {
  person2: {
    age: 30,
  },
  person3: {
    name: 'mandy',
    age: 40,
  },
}

const updatedState = merge(oldState, stateUpdates)

oldState === updatedState // false
oldState.person1 === updatedState.person1 // true
oldState.person2 === updatedState.person2 // false
newState.person2 === updatedState.person2 // false
newState.person3 === updatedState.person3 // true

/*
updatedState will look like:
{
  person1: {
    name: 'bob',
    age: 30,
  },
  person2: {
    name: 'cindy',
    age: 30,
  },
  person3: {
    name: 'mandy',
    age: 40,
  },
}
*/
```

## Update cases

When statesis encounters 2 objects, it will attempt to reReference or merge them directly. If, however, it encounters an object in the old state and a primitive in the same location in the new state/state updates, then it will behave differently depending on the source and update types. These special cases are listed below.

### Object to primitive
If an object turns into a primitive or visa versa, the update always takes full preference:
```javascript
const oldState = {
  thing1: {
    field: 1,
  },
  thing2: 2
}

const newState = {
  thing1: 5,
  thing2: {
    field: 1
  }
}

/*
both
reReference(oldState, newState)
and
merge(oldState, newState)

would result in values equal to newState
*/
```

### Object to List
As with primitives, lists are handled in the same way in that they will overwrite or be overwritten by an object.
```javascript
const oldState = {
  thing1: {
    field: 1,
  },
  thing2: [ 1, 2],
}

const newState = {
  thing1: [2, 3],
  thing2: {
    field: 1
  }
}

/*
both
reReference(oldState, newState)
and
merge(oldState, newState)

would result in values equal to newState
*/
```

### Lists with Lists
When reReferencing or updating a list with a new list, each item in the new list is compared to the item in the old list at the same position. If they match, then the reference is kept. However, the end value will match the new list, so if the new list is shorter than the old, then it will remain shorter in the re-referenced version.
```javascript
const oldState = [1, {a:2}, {b:3}, 'b', null]
const newState = [2, {a:3}, {b:3}, 'c']

const reReferencedState = reReference(oldState, newState)
const updatedState = merge(oldState, newState)
/*
reReferencedState would look like newState: [2, {a: 3}, {b:3}, 'c']
updatedState would also look like newState: [2, {a: 3}, {b:3}, 'c']
*/

for(statesisState of [reReferencedState, updatedState]) {
  statesisState[0] === oldState[0] // false as 2 != 1
  statesisState[0] === newState[0] // true
  statesisState[1] === oldState[1] // false as {a:2} != {a:3}
  statesisState[1] === newState[1] // true
  statesisState[2] === oldState[2] // true as {b:2} == {b:2} and the reference will be kept
  statesisState[2] === newState[2] // false, even though {b:2} == {b:2}, the reference will be pointing to the old state
  statesisState[3] === oldState[3] // false, 'b' != 'c'
  statesisState[3] === newState[3] // true
  statesisState[4] === oldState[4] // false, undefined !== null
}
```
