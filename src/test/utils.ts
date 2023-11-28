import assert from 'assert';

export function assertIsHTMLInputElement(
  val: unknown
): asserts val is HTMLInputElement {
  assert(val instanceof HTMLInputElement, 'expected to be an HTMLInputElement');
}
