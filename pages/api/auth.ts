import { prisma } from "@/ssr/db";
import { NextApiRequestExtended } from "@/types";
import type { NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import rateLimit from "@/ssr/rate-limit";

const limiter = rateLimit({
  interval: 10 * 1000,
  uniqueTokenPerInterval: 500,
});

export default async function handler(
  req: NextApiRequestExtended,
  res: NextApiResponse
) {
  try {
    if (!req.headers["x-forwarded-for"])
      return res.send({
        success: false,
        msg: '"X-Forwarded-For" header not defined!',
      });
    await limiter.check(res, 3, req.headers["x-forwarded-for"] as string);
    if (req.method === "GET") {
    } else if (req.method === "POST") {
      const { username, password } = req.body;
      if (!username || !password)
        return res
          .status(400)
          .json({ success: false, msg: "Invalid parameters!" });

      const targetUser = await prisma.user.findFirst({ where: { username } });
      if (!targetUser || !(await bcrypt.compare(password, targetUser.password)))
        return res
          .status(400)
          .json({ success: false, msg: "Wrong username or password!" });

      const token = jwt.sign(
        { id: targetUser.id },
        process.env.JWT as string,
        {}
      );
      res.send({ success: true, msg: "There ya go!", token });
    } else if (req.method === "PATCH") {
      const { username, password, token } = req.body;
      if (!username || !password || !token)
        return res
          .status(400)
          .json({ success: false, msg: "Invalid parameters!" });

      const invitation = await prisma.invite.findFirst({
        where: { token, active: true },
      });
      if (!invitation || !invitation.active)
        return res
          .status(400)
          .json({ success: false, msg: "Invalid invitation!" });

      const targetUser = await prisma.user.create({
        data: { password: await bcrypt.hash(password, 10), role: 2, username },
      });

      await prisma.invite.update({
        where: { id: invitation.id },
        data: { active: false },
      });

      const jwtToken = jwt.sign(
        { id: targetUser.id },
        process.env.JWT as string,
        {}
      );
      res.send({ success: true, msg: "There ya go!", token: jwtToken });
    } else res.status(404).end();
  } catch (e: any) {
    return res.status(400).json({ success: false, msg: e.message });
  }
}
