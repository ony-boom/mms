export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: process.env.SESSION_SECRET,
    name: "auth-session",
  });

  const isAuthenticated = session.data.isAuthenticated;
  const userId = session.data.userId;
  const userName = session.data.userName;

  const user =
    isAuthenticated && userId
      ? {
          id: userId,
          name: userName,
        }
      : null;

  return {
    success: true,
    error: null,
    data: {
      message: "pong",
      isAuthenticated,
      user: user,
    },
  };
});
