/** Convert a Mongoose lean document's _id to a plain string `id` field. */
export function normalize<T extends { _id?: unknown }>(doc: T): Omit<T, "_id"> & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: String(_id) } as Omit<T, "_id"> & { id: string };
}

export function normalizeAll<T extends { _id?: unknown }>(docs: T[]) {
  return docs.map(normalize);
}
