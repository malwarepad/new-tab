import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

export const prisma = new PrismaClient();

prisma
  .$connect()
  .then(async () => {
    console.log("Database connection established successfully.");
    if (!(await prisma.user.count({ where: { username: "admin" } })))
      await prisma.user.create({
        data: {
          username: "admin",
          password: await bcrypt.hash("password", 10),
          role: 3,
        },
      });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
