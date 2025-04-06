export async function onRequest(context) {
  const { request, redirect, next } = context;
  
  // Handle trailing slashes: redirect to the non-trailing slash version
  const url = new URL(request.url);
  if (url.pathname.endsWith('/') && url.pathname.length > 1) {
    url.pathname = url.pathname.slice(0, -1);
    return redirect(url.toString());
  }

  // Continue processing the request
  return next();
}