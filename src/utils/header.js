const setHeader = (request, opts) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(
    request.url,
    `${protocol}://${request.headers['host']}`
  );
  return {
    href: parsedUrl.href,
    origin: parsedUrl.origin,
    pathname: parsedUrl.pathname,
    search: parsedUrl.search,
    searchParams: parsedUrl.searchParams.toString(),
    hostname: request.headers['host'].replace(/:[0-9]+$/, ''),
    protocol: opts.https ? 'https' : 'http',
    port: opts.https ? '443' : '80',
  };
};

module.exports = { setHeader };
