import { prisma } from "@/ssr/db";
import { NextApiRequestExtended } from "@/types";
import type { NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import rateLimit from "@/ssr/rate-limit";
import validateAuth from "@/ssr/validateAuth";

export default async function handler(
  req: NextApiRequestExtended,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const user = await validateAuth(req, 1);
      const { password } = req.body;
      if (!password)
        return res
          .status(400)
          .json({ success: false, msg: "Invalid parameters!" });

      await prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(password, 10) },
      });

      res.send({ success: true, msg: "Operation completed successfully!" });
    } else res.status(404).end();
  } catch (e: any) {
    return res.status(400).json({ success: false, msg: e.message });
  }
}
