// This magical code is based on that from user Gerrit0 on stackoverflow:
// https://stackoverflow.com/questions/60795256/typescript-type-merging
type Primitive = string | number | boolean | bigint | symbol | null | undefined
type Expand<T> = T extends Primitive ? T : { [K in keyof T]: T[K] }

type OptionalKeys<T> = {
  [K in keyof T]-?: T extends Record<K, T[K]> ? never : K;
}[keyof T]

type RequiredKeys<T> = {
  [K in keyof T]-?: T extends Record<K, T[K]> ? K : never;
}[keyof T] &
keyof T

type RequiredMergeKeys<T, U> = Exclude<RequiredKeys<T>, OptionalKeys<U>> | RequiredKeys<U>

type OptionalMergeKeys<T, U> =
    | OptionalKeys<U>
    | Exclude<OptionalKeys<T>, RequiredKeys<T>>

type MergeNonUnionObjects<T, U> = Expand<
{
  [K in RequiredMergeKeys<T, U>]: K extends keyof (T | U)
    ? Expand<Merge<T[K], U[K]>>
    : K extends keyof T
      ? T[K]
      : K extends keyof U
        ? U[K]
        : never;
} & {
  [K in OptionalMergeKeys<T, U>]?: K extends keyof T
    ? K extends keyof U
      ? Expand<Merge<
      Exclude<T[K], undefined>,
      Exclude<U[K], undefined>
      >>
      : T[K]
    : K extends keyof U
      ? U[K]
      : never;
}
>


type MergeArrays<U extends readonly any[]> = U

type MergeObjects<T, U> = [T] extends [never]
  ? U extends any
    ? MergeNonUnionObjects<T, U>
    : never
  : [U] extends [never]
    ? T extends any
      ? MergeNonUnionObjects<T, U>
      : never
    : T extends any
      ? U extends any
        ? MergeNonUnionObjects<T, U>
        : never
      : never

export type Merge<T, U> =
U extends Primitive ? U :
  | MergeArrays<Extract<U, readonly any[]>>
  | MergeObjects<Exclude<T, Primitive | readonly any[]>, Exclude<U, Primitive | readonly any[]>>
