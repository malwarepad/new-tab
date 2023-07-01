import { prisma } from "@/ssr/db";
import { NextApiRequestExtended } from "@/types";
import {
  LinkAdditionValidator,
  LinkEditValidator,
} from "@/validation/linkAddition";
import multer from "multer";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

import { v4 as uuidv4 } from "uuid";
import validateAuth from "@/ssr/validateAuth";

function runMiddleware(
  req: NextApiRequest & { [key: string]: any },
  res: NextApiResponse,
  fn: (...args: any[]) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const getFileExtension = (filename: string) => {
  if (filename.includes(".")) return filename.split(".").pop();
  return "bin";
};

const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (_, file, cb) =>
    cb(null, uuidv4() + "." + getFileExtension(file.originalname)),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequestExtended,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const user = await validateAuth(req, 2);
      const multerUpload = multer({
        storage: storage,
      });

      await runMiddleware(req, res, multerUpload.single("file"));

      const file = req?.file;

      const validate = LinkAdditionValidator.validate(req.body);
      if (validate.error) {
        if (file) await fs.promises.unlink(`./${file.path}`);
        return res
          .status(400)
          .json({ success: false, msg: validate.error.details[0].message });
      }

      const { label, uri } = req.body;

      const links = await prisma.link.findMany({
        where: { creator: { id: user.id } },
      });

      await prisma.link.create({
        data: {
          order: links.length,
          // links.length > 0
          // ? links.reduce((acc, curr) =>
          //     acc.order > curr.order ? acc : curr
          //   ).order + 1
          // : 0,
          icon: file
            ? `/api/public/uploads/${file.filename}`
            : `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${uri}&size=50`,
          label,
          uri,
          creator: { connect: { id: user.id } },
        },
      });

      return res
        .status(200)
        .json({ success: true, msg: "Link has been added successfuly!" });
    } else if (req.method === "PATCH") {
      const user = await validateAuth(req, 2);
      const multerUpload = multer({
        storage: storage,
      });

      await runMiddleware(req, res, multerUpload.single("file"));

      const file = req?.file;

      const validate = LinkEditValidator.validate(req.body);
      if (validate.error) {
        if (file) await fs.promises.unlink(`./${file.path}`);
        return res
          .status(400)
          .json({ success: false, msg: validate.error.details[0].message });
      }

      const { label, uri, id } = req.body;

      const item = await prisma.link.findFirst({
        where: { id: parseInt(id), creator: { id: user.id } },
      });

      if (!item)
        return res
          .status(400)
          .json({ success: false, msg: "No such link can be found!" });

      await prisma.link.update({
        where: { id: item.id },
        data: {
          label,
          uri,
          icon: file
            ? `/api/public/uploads/${file.filename}`
            : `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${uri}&size=50`,
        },
      });

      return res
        .status(200)
        .json({ success: true, msg: "Link has been edited successfuly!" });
    } else res.status(404).end();
  } catch (e: any) {
    return res.status(400).json({ success: false, msg: e.message });
  }
}
