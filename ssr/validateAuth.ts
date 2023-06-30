import { GetServerSidePropsContext, NextApiRequest, PreviewData } from "next";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "./db";
import { ParsedUrlQuery } from "querystring";

const error = {
  message: "Failure to identify! This is an authenticated route!",
};

async function validate(targetJwt: string, role: number) {
  // verify the jwt
  const verify = jwt.verify(targetJwt, process.env.JWT as string) as JwtPayload;

  // securely fetch the id
  if (!verify || !verify?.id) throw error;
  const id = verify.id as number;

  // find the target user
  const targetUser = await prisma.user.findFirst({
    where: { id },
    include: { UserSettings: {} },
  });
  if (!targetUser || targetUser?.role < role) throw error; // verifying target role

  // return the target user
  return targetUser;
}

export default async function validateAuth(req: NextApiRequest, role: number) {
  // pull auth header
  const { authorization } = req.headers;
  if (!authorization || !authorization.includes("Bearer ")) throw error;

  return await validate(authorization.replace("Bearer ", ""), role);
}

export async function validateSSRAuth(
  req: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>["req"],
  role: number
) {
  const { token } = req.cookies;
  return await validate(token as string, role);
}
