/** PostgREST to-one embeds are objects; some generated types also allow arrays. */
export function oneRelation<T>(value:T|T[]|null|undefined):T|undefined {
  return (Array.isArray(value)?value[0]:value)??undefined;
}
