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
    if (req.method === "GET") {
      const user = await validateAuth(req, 3);

      const users = await prisma.user.findMany({});

      res.status(200).json({
        success: true,
        msg: "There ya go...",
        users: users.map(({ password, ...rest }: { password: string }) => rest),
      });
    } else if (req.method === "POST") {
      const user = await validateAuth(req, 3);

      const invitation = await prisma.invite.create({ data: {} });

      res.status(200).json({
        success: true,
        msg: "There ya go...",
        invite: invitation.token,
      });
    } else if (req.method === "DELETE") {
      const user = await validateAuth(req, 3);
      const { id } = req.query;

      if (!id)
        return res
          .status(400)
          .json({ success: false, msg: "Invalid parameters" });

      const targetUser = await prisma.user.findFirst({
        where: { id: parseInt(id as string) },
      });

      if (!targetUser)
        return res
          .status(400)
          .json({ success: false, msg: "No such user can be found!" });

      if (targetUser.id === user.id)
        return res
          .status(400)
          .json({ success: false, msg: "You cannot delete yourself!" });

      await prisma.user.delete({ where: { id: targetUser.id } });

      res.status(200).json({
        success: true,
        msg: "Operation completed successfully!",
      });
    } else res.status(404).end();
  } catch (e: any) {
    return res.status(400).json({ success: false, msg: e.message });
  }
}
