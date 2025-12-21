export function assert_not_none<T>(value: T | null | undefined): T {
  if (value == null) {
    throw new Error('Assertion failed');
  }
  return value;
}
