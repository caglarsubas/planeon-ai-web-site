/** Keep shared transformation links working at the dedicated Services page. */
export function GET(request: Request): Response {
  const destination = new URL(request.url);
  destination.pathname = '/services';
  return Response.redirect(destination, 308);
}
