export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event);

  if (
    !pathname.startsWith("/api/cover/") &&
    !pathname.startsWith("/api/tracks/audio/")
  ) {
    return;
  }

  const session = await useSession(event, {
    password: process.env.SESSION_SECRET,
    name: "auth-session",
  });

  const isAuthenticated = session.data.isAuthenticated;

  if (!isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required for media access",
    });
  }
});
