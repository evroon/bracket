export function assert_not_none<T>(value: T | null) {
  if (value === null) {
    throw new Error('Assertion failed');
  }
  return value;
}
