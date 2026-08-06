/**
 * Print only one region of the page. The element keeps the `print-target`
 * class for the duration of the print dialog; the print rules in theme.ts do
 * the rest.
 */
export function printRegion(node: HTMLElement | null): void {
  if (!node) return;
  node.classList.add('print-target');
  document.body.classList.add('print-scoped');

  const cleanup = () => {
    node.classList.remove('print-target');
    document.body.classList.remove('print-scoped');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  window.print();
  // Safari does not always raise afterprint; clear on the next tick as well.
  window.setTimeout(cleanup, 1_000);
}
