# Statesis
An object re-referencer and merger.

## Capabilities

Statesis allows you to re-reference an object from an existing object, or to merge updates from a new object into the old while keeping references to the unchanged fields within the object. This is particularly useful where object immutability is required/preferred (e.g. in React).

### reReference

### merge

## Use in React/Redux
Statesis should be used in an environment where a new state object is often equal to or very similar to the old but because of the tools used, it is recreated with completely new references. Statesis allows you to create a new state object re-using the referenced objects from the old state to avoid props changed events from firing.

Statesis is useful in places where doing a deep scan and build of a state is less detrimental than doing a deep compare at the componentWillReceiveProps event (i.e. if a change in state will cause many components to rerender).

## How it works
Statesis does a deep compare/copy of 2 objects and compiles a new objects which keeps references to unchanged objects from the old objects and mixes them with new objects which have altered in the new objects.

For example if we had an old objects:

```javascript
oldState = {
  person1: {
    name: 'bob',
    age: 30,
  },
  person2: {
    name: 'cindy',
    age: 27,
  },
}
```

And we created a new object as follows:
```javascript
newState = {...oldState}

newState.person1 = {...oldState.person1}

newState.person2 = {...oldState.person2}

newState.person1.age = 31
```

We would get the following results:
```javascript
oldState === newState
// false, as desired

oldState.person1 === newState.person1
// false, also as desired since the age changed

oldState.person2 === newState.person2
/* false, which is undesirable because if anything was connected to
this object then it would register a props change*/
```

If we now use the `reReference` method from statesis, we get the following:
```javascript
blendedState = reReference(oldState, newState)

oldState === blendedState
// false, as desired

oldState.person1 === blendedState.person1
// false, also as desired since the age changed

oldState.person2 === blendedState.person2
// true, as desired to avoid props changing
```

Statesis works with primitive types and objects alike. It is compatible with nested objects and arrays. For now there is no smart tracking of objects within arrays so if the 10th item is removed from an array of length 21 then the last ten items will have new references.

## To install
Statesis is available on npm. just run `npm install statesis` to install.

## Usage
Example usage:
```javascript
import { reReference, merge } from 'statesis'

const reReferencedState = reReference(oldState, newState)
const mergedState = merge(oldState, newState)
```
