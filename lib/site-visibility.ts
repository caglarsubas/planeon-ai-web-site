// Change this to true and publish to restore the page and all its entry points.
export const maturityPageEnabled = false;

export function isPublicPageVisible(href: string) {
  return maturityPageEnabled || !/^\/maturity(?:[/?#]|$)/.test(href);
}
