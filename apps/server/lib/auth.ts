import bcrypt from "bcryptjs";
import { User } from "@prisma/client";
import { prisma } from "~~/prisma";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function findUserByName(name: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: {
      name,
    },
  });
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await findUserByName(email);
  if (!user || !user.password) return null;
  const isValid = await verifyPassword(password, user.password);
  return isValid ? user : null;
}
