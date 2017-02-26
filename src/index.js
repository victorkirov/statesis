import {map} from 'lodash'

export function blend (oldState, newState) {
    if (oldState === newState) return oldState

    if (typeof oldState !== 'object' || oldState === null) return newState

    return oldState
}
