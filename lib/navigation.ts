const resourceRoutes = ['/blueprint', '/journey', '/evolution', '/explorer', '/roadmap', '/whitepaper'];

/** The exact page and its owning navigation section are different states. */
export function navigationCurrent(
  pathname: string,
  href: string,
): 'page' | 'location' | undefined {
  if (pathname === href) return 'page';
  if (href !== '/' && pathname.startsWith(`${href}/`)) return 'location';
  if (
    href === '/resources' &&
    resourceRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  )
    return 'location';
  return undefined;
}
