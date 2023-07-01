import { GetServerSideProps } from "next";
import { createContext, useContext } from "react";
import { prisma } from "@/ssr/db";
import { LinkType, User } from "@/types";
import Topbar from "@/components/root/topbar";
import Mainarea from "@/components/root/mainarea";
import Customize from "@/components/root/customize";
import { validateSSRAuth } from "@/ssr/validateAuth";
import Head from "next/head";

function escape(obj: object) {
  return JSON.parse(JSON.stringify(obj));
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const user = await validateSSRAuth(context.req, 1);

    const links = await prisma.link.findMany({
      orderBy: { order: "asc" },
      where: { creatorId: user.id },
    });
    return {
      props: {
        links: links,
        user: escape(user),
      },
    };
  } catch (e: any) {
    return {
      redirect: {
        destination: "/login",
        permanent: true,
      },
    };
  }
};

export const userContext = createContext<User | undefined>(undefined);

export default function Home({
  links,
  user,
}: {
  links: LinkType[];
  user: User;
}) {
  return (
    <userContext.Provider value={user}>
      <Head>
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
        <title>{process.env.NEXT_PUBLIC_NAME}</title>
      </Head>
      <main
        className="min-h-screen text-white flex flex-col"
        style={{
          background:
            user.UserSettings.find((o) => o.key === "BgColor")?.value ||
            "#35363a",
        }}
      >
        <Topbar />
        <Mainarea links={links} />
        <Customize />
      </main>
    </userContext.Provider>
  );
}
