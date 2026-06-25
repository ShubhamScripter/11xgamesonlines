/** Allow only MongoDB connect + server boot lines in the terminal. */
const ALLOW_BOOT_LOG =
  /Connected to MongoDB|server running on port/i;

const origLog = console.log.bind(console);

console.log = (...args) => {
  const text = args
    .map((a) => (typeof a === 'string' ? a : String(a)))
    .join(' ');
  if (ALLOW_BOOT_LOG.test(text)) {
    origLog(...args);
  }
};

console.warn = () => {};
console.info = () => {};
console.debug = () => {};
console.error = () => {};

/** Escape hatch for rare manual debugging (not used in normal boot). */
export function bootLog(...args) {
  origLog(...args);
}
