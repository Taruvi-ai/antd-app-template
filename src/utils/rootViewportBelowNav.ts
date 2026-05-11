/** Current Navkit banner height in px (`0` if element missing). */
export function readNavkitHeightPx(navRoot: HTMLElement | null): number {
  return navRoot?.offsetHeight ?? 0;
}

/**
 * Sets on `:root`:
 * - `--nav-height` — measured banner height (or `0px`)
 * - `--app-available-height` — `calc(100vh - <that px>)`
 *
 * Re-applies on resize. Returns cleanup.
 */
export function syncRootViewportBelowNav(navRoot: HTMLElement | null): () => void {
  const doc = document.documentElement;

  const apply = () => {
    const h = readNavkitHeightPx(navRoot);
    doc.style.setProperty("--nav-height", `${h}px`);
    doc.style.setProperty("--app-available-height", `calc(100vh - ${h}px)`);
  };

  apply();

  if (!navRoot) {
    return () => {
      doc.style.removeProperty("--nav-height");
      doc.style.removeProperty("--app-available-height");
    };
  }

  const ro = new ResizeObserver(apply);
  ro.observe(navRoot);

  return () => {
    ro.disconnect();
    doc.style.removeProperty("--nav-height");
    doc.style.removeProperty("--app-available-height");
  };
}
