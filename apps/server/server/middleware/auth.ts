import { sendError, createError } from "h3";

export default defineEventHandler(async (event) => {
  const req = event.node.req;
  const method = req.method || "GET";
  const { pathname } = getRequestURL(event);

  if (method === "OPTIONS") {
    return;
  }

  const publicRoutes = ["/api/auth/login", "/api/auth/register", "/api/ping"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!pathname.startsWith("/api") || isPublicRoute) {
    return;
  }

  // Check session authentication
  const session = await useSession(event, {
    password: process.env.SESSION_SECRET,
    name: "auth-session",
  });

  const isAuthenticated = session.data.isAuthenticated;
  const userId = session.data.userId;
  const userName = session.data.userName;

  if (!isAuthenticated || !userId) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      }),
    );
  }

  // Attach user data to context for use in other handlers
  event.context.user = {
    id: userId,
    name: userName,
  };
});
