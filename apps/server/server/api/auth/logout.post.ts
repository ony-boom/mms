export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: process.env.SESSION_SECRET,
    name: "auth-session",
  });

  // Clear all session data
  await session.clear();

  return { success: true };
});
