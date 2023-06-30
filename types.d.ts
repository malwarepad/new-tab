import { NextApiRequest } from "next";

export type LinkType = {
  id: number;
  icon: string;
  label: string;
  uri: string;

  onClick?: MouseEventHandler<HTMLAnchorElement>;
  noOptions?: boolean;
  index?: number;
};

export type NextApiRequestExtended = NextApiRequest & {
  file: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
  };
};

export type User = {
  id: number;
  createdAt: string;
  username: string;
  password: string;
  role: number;
  UserSettings: {
    id: number;
    key: string;
    value: string;
    userId: number;
  }[];
  Links?: LinkType[];
};

export type Invitation = {
  id: number;
  token: string;
  active: boolean;
};
