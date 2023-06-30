import { prisma } from "@/ssr/db";
import validateAuth from "@/ssr/validateAuth";
import { LinkEditValidator } from "@/validation/linkAddition";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "PATCH") {
      const user = await validateAuth(req, 2);
      const { id, left } = req.body;
      if (!id)
        return res
          .status(400)
          .json({ success: false, msg: "Invalid arguments!" });

      const document1 = await prisma.link.findFirst({
        where: { id: parseInt(id as string), creator: { id: user.id } },
      });
      if (!document1)
        return res.status(400).json({ success: false, msg: "No such link!" });
      const document2 = await prisma.link.findFirst({
        where: {
          order: left ? document1.order - 1 : document1.order + 1,
          creator: { id: user.id },
        },
      });
      if (!document2)
        return res.status(400).json({ success: false, msg: "No such link!" });

      await prisma.link.update({
        where: { id: document1.id },
        data: { order: document2.order },
      });

      await prisma.link.update({
        where: { id: document2.id },
        data: { order: document1.order },
      });

      return res
        .status(200)
        .json({ success: true, msg: "Operation completed successfuly!" });
    } else if (req.method === "DELETE") {
      const user = await validateAuth(req, 2);
      const { id } = req.query;
      if (!id)
        return res
          .status(400)
          .json({ success: false, msg: "Invalid arguments!" });

      const link = await prisma.link.findFirst({
        where: { id: parseInt(id as string), creator: { id: user.id } },
      });

      if (!link)
        return res.status(400).json({ success: false, msg: "No such link!" });

      await prisma.link.delete({ where: { id: parseInt(id as string) } });
      await prisma.link.updateMany({
        where: { order: { gt: link.order } },
        data: { order: { decrement: 1 } },
      });
      return res
        .status(200)
        .json({ success: true, msg: "Link has been deleted successfuly!" });
    } else if (req.method === "PUT") {
      const user = await validateAuth(req, 2);
      const toChange = await prisma.link.findMany({
        where: { creator: { id: user.id } },
      });
      let tmp = 0;
      for await (const item of toChange) {
        await prisma.link.update({
          where: { id: item.id },
          data: { order: tmp },
        });
        tmp++;
      }
      return res
        .status(200)
        .json({ success: true, msg: "Link order reset successfuly!" });
    }
    res.status(404).end();
  } catch (e: any) {
    return res.status(400).json({ success: false, msg: e.message });
  }
}
