import type Fuse from 'fuse.js'

export interface FuseResult<T> {
  item: T
  // Fuse's search results expose readonly match arrays; reflect that in our type
  matches?: ReadonlyArray<Fuse.FuseResultMatch>
}
