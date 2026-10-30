// Prepared update for the existing couragier-api gateway.
// Add service binding EDUCATOR_SERVICE -> couragier-educator before deployment.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/" || path === "/health") {
        return Response.json({
          ok: true,
          service: "COURAGIER API Gateway",
          routes: {
            webinar: "/webinar/*",
            educator: "/educator/*",
            moncash: "/payments/moncash/*",
            whop: "/whop/*"
          }
        });
      }

      // Educator has its own independent Worker, separate from webinars.
      if (path === "/educator" || path.startsWith("/educator/")) {
        return env.EDUCATOR_SERVICE.fetch(request);
      }

      if (path === "/webinar" || path.startsWith("/webinar/")) {
        return env.WEBINAR_SERVICE.fetch(request);
      }

      if (path === "/payments/moncash" || path.startsWith("/payments/moncash/")) {
        return env.MONCASH_SERVICE.fetch(request);
      }

      if (path === "/whop" || path.startsWith("/whop/")) {
        return env.WHOP_SERVICE.fetch(request);
      }

      return Response.json(
        {ok: false, error: "COURAGIER API route not found", path},
        {status: 404}
      );
    } catch (error) {
      console.error("COURAGIER API gateway error:", error);
      return Response.json(
        {ok: false, error: "COURAGIER API gateway failed"},
        {status: 500}
      );
    }
  }
};
