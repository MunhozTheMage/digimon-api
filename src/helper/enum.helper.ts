export const enumUnserializer = <
  K extends string | number | symbol,
  V extends string | number | symbol
>(
  enumSerializer: Record<K, V>
): Record<V, K> => {
  return Object.fromEntries(
    Object.entries(enumSerializer).map(([key, value]) => [value, key])
  );
};
