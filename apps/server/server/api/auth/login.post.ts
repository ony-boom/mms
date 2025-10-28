import { readBody } from "h3";
import { authenticateUser } from "~~/lib/auth";

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody<{
    username: string;
    password: string;
  }>(event);

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "username and password are required",
    });
  }

  const user = await authenticateUser(username, password);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  // Initialize session
  const session = await useSession(event, {
    password: process.env.SESSION_SECRET, // Make sure this is set in your .env
    name: "auth-session",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  });

  // Store user data in session
  await session.update({
    userId: user.id,
    userName: user.name,
    isAuthenticated: true,
    loginTime: Date.now(),
  });

  return {
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
      },
    },
  };
});
