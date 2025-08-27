import { prisma } from "~~/prisma";
import { hashPassword } from "~~/lib/auth";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "userId");
  const data = await readBody<{
    username?: string;
    password?: string;
  }>(event);

  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!currentUser) {
    setResponseStatus(event, 404);
    return {
      data: null,
      success: false,
      error: "User not found",
    };
  }

  if (!data.username && !data.password) {
    setResponseStatus(event, 304); // Not Modified

    return {
      data: {
        id: currentUser?.id,
        name: currentUser?.name,
      },
      success: true,
      error: null,
    };
  }

  try {
    const newPassword = data.password
      ? await hashPassword(data.password)
      : currentUser.password;

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: data.username ?? currentUser.name,
        password: newPassword,
      },
    });

    return {
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
      },
      success: true,
      error: null,
    };
  } catch (e) {
    setResponseStatus(event, 500);
    return {
      data: null,
      success: false,
      error: e.message,
    };
  }
});
