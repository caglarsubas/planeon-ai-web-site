/** Playground is a compatibility alias; Journey owns the walkthrough and AML mapping. */
export function GET(request: Request): Response {
  const destination = new URL(request.url);
  destination.pathname = '/journey';
  return Response.redirect(destination, 308);
}
