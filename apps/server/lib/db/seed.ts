import { Prisma } from "@prisma/client";
import { prisma } from "~~/prisma";
import { hashPassword } from "../auth";

export async function seed() {
  const hashedPassword = await hashPassword("foobar");

  const defaultUser: Prisma.UserCreateInput = {
    name: "admin",
    password: hashedPassword,
  };

  const hasUsers = await prisma.user.count();

  if (!hasUsers) {
    await prisma.user.upsert({
      where: { name: defaultUser.name },
      update: {},
      create: defaultUser,
    });
  }
}
