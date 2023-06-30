import { TextField } from "@/components/reusable/dialog";
import { prisma } from "@/ssr/db";
import axios, { AxiosError } from "axios";
import { GetServerSideProps } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";

import { useCookies } from "react-cookie";

const inter = Inter({ subsets: ["latin"] });

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.query;
  if (!token)
    return {
      redirect: { permanent: true, destination: "/" },
    };

  const invitation = await prisma.invite.findFirst({
    where: { token: token as string },
  });

  if (!invitation)
    return {
      redirect: { permanent: true, destination: "/" },
    };

  return {
    props: {},
  };
};

export default function Register() {
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [error, setError] = useState<string>();
  const [token, setToken] = useCookies(["token"]);
  const router = useRouter();
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { token } = router.query;
    const request = await axios
      .patch("/api/auth", { username, password, token })
      .catch((e: AxiosError) => e.response);

    if (request?.data?.success) {
      setToken("token", request.data.token, { path: "/" });
      router.push("/");
      return;
    }

    setError(request?.data?.msg);
  };
  return (
    <div className="flex h-screen items-center justify-end bg-[url(https://picsum.photos/1920/1080/?random)] bg-no-repeat bg-fixed bg-center">
      <Head>
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
      </Head>
      <form
        className={`bg-[#35363a]/75 h-full text-white ${inter.className} flex flex-col gap-2 justify-center px-5`}
        onSubmit={handleRegister}
      >
        <h1 className="text-xl">Welcome to {process.env.NEXT_PUBLIC_NAME}!</h1>
        <div>
          <div>Username</div>
          <input
            className={TextField}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <div>Password</div>
          <input
            className={TextField}
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div>{error}</div>}
        <div className="text-center">
          <button className="px-2 py-1 bg-green-600 hover:bg-green-700 transition-all rounded">
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
