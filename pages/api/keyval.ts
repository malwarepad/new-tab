import { prisma } from "@/ssr/db";
import { NextApiRequestExtended } from "@/types";
import type { NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validateAuth from "@/ssr/validateAuth";

export default async function handler(
  req: NextApiRequestExtended,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const user = await validateAuth(req, 2);
      const { key, value } = req.body;
      if (!key || !value)
        return res
          .status(400)
          .json({ success: false, msg: "Invalid arguments!" });

      if (user.UserSettings.some((o: { key: string }) => o.key === key))
        await prisma.userSettings.update({ where: { key }, data: { value } });
      else
        await prisma.userSettings.create({
          data: { key, value, user: { connect: { id: user.id } } },
        });

      res.status(200).json({ success: true, msg: "Key saved!" });
    } else if (req.method === "DELETE") {
      const user = await validateAuth(req, 2);
      await prisma.userSettings.deleteMany({
        where: { user: { id: user.id } },
      });

      res.status(200).json({ success: true, msg: "Keys reset!" });
    } else res.status(404).end();
  } catch (e: any) {
    return res.status(400).json({ success: false, msg: e.message });
  }
}
