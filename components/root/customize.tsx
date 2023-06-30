import Image from "next/image";
import PencilSvg from "../../assets/svg/pencil.svg";
import { FormEvent, useState } from "react";
import CloseSvg from "../../assets/svg/close.svg";
import { userContext } from "@/pages";

import { Roboto } from "next/font/google";
import axios from "axios";
import { useCookies } from "react-cookie";
import Router from "next/router";
import { TextField } from "../reusable/dialogEdit";
import Admin from "./admin";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

async function ChangeKeyVal(key: string, value: string, token: string) {
  const request = await axios
    .post(
      "/api/keyval",
      { key, value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .catch((e) => undefined);

  if (request?.data?.success) await Router.replace(Router.asPath);

  return request?.data?.success || false;
}

export default function Customize() {
  const [open, setOpen] = useState(false);
  const [pfpValue, setPfpValue] = useState<string>();
  const [password, setPassword] = useState("");
  const [token, setToken] = useCookies(["token"]);

  async function handleReset() {
    const request = await axios
      .delete("/api/keyval", {
        headers: {
          Authorization: `Bearer ${token.token}`,
        },
      })
      .catch((e) => undefined);

    if (request?.data?.success) {
      await Router.replace(Router.asPath);
      setPfpValue(undefined);
    }
  }

  const handlePasswordReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const request = await axios
      .post(
        "/api/password",
        {
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token.token}`,
          },
        }
      )
      .catch((e) => undefined);

    if (request?.data?.success) {
      setToken("token", undefined);
      Router.push("/login");
    }
  };

  return (
    <userContext.Consumer>
      {(user) => (
        <>
          <div className="absolute bottom-0 right-0">
            <button
              onClick={() => setOpen(true)}
              className="text-[#8ab4f8] bg-[#202124] hover:bg-[#282c34] transition-all flex flex-row items-center gap-2 shadow-lg m-4 py-2 px-4 rounded-3xl"
            >
              <Image
                src={PencilSvg}
                className="w-4"
                alt="Customization icon"
                draggable={false}
              />
              Customize Chrome
            </button>
          </div>
          {open && (
            <div
              className={`absolute top-0 m-0 right-0 p-[1.0625rem] h-full bg-[#35363a] border-l border-[#606164] flex flex-col ${roboto.className}`}
            >
              <div className="flex flex-row justify-end bg-[#292a2d] rounded-t border-b border-[#3c4043] py-1 px-2">
                <Image
                  src={CloseSvg}
                  alt=""
                  className="hover:bg-[#37393c] rounded-full w-6 p-1"
                  onClick={() => setOpen(false)}
                  draggable={false}
                />
              </div>
              <div className="bg-[#202124] py-3 px-5 flex flex-col gap-2">
                <h1 className="text-xl">User settings</h1>
                <div className="flex flex-row justify-between">
                  <div>
                    <div>Background color</div>
                    <input
                      type="color"
                      onChange={(e) =>
                        ChangeKeyVal("BgColor", e.target.value, token.token)
                      }
                      value={
                        user?.UserSettings?.find((o) => o.key === "BgColor")
                          ?.value || "#35363a"
                      }
                    />
                  </div>
                  <div>
                    <div>Focus color</div>
                    <input
                      type="color"
                      onChange={(e) =>
                        ChangeKeyVal("FocusColor", e.target.value, token.token)
                      }
                      value={
                        user?.UserSettings?.find((o) => o.key === "FocusColor")
                          ?.value || "#4a4a4e"
                      }
                    />
                  </div>
                  <div>
                    <div>Search color</div>
                    <input
                      type="color"
                      onChange={(e) =>
                        ChangeKeyVal("SearchColor", e.target.value, token.token)
                      }
                      value={
                        user?.UserSettings?.find((o) => o.key === "SearchColor")
                          ?.value || "#ffffff"
                      }
                    />
                  </div>
                </div>
                <div>
                  <div>Profile URL</div>
                  <form
                    className="flex flex-row items-center justify-center gap-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      ChangeKeyVal(
                        "ProfileUrl",
                        pfpValue as string,
                        token.token
                      );
                    }}
                  >
                    <input
                      type="text"
                      className={TextField}
                      onChange={(e) => setPfpValue(e.target.value)}
                      value={
                        pfpValue ||
                        user?.UserSettings?.find((o) => o.key === "ProfileUrl")
                          ?.value ||
                        "https://raw.malwarepad.com/logo/user.png"
                      }
                    />
                    <button className="px-2 py-1 transition-all rounded">
                      Save
                    </button>
                  </form>
                </div>
                <div>
                  <button
                    className="px-2 py-1 bg-neutral-500 hover:bg-neutral-600 transition-all rounded"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
              </div>
              <hr />
              <div className="bg-[#202124] py-3 px-5 flex flex-col gap-2">
                <h1 className="text-xl">Reset my password</h1>
                <form
                  className="flex flex-row items-center justify-center gap-1"
                  onSubmit={handlePasswordReset}
                >
                  <input
                    type="password"
                    className={TextField}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password..."
                  />
                  <button className="px-2 py-1 transition-all rounded">
                    Save
                  </button>
                </form>
              </div>
              <hr />
              <Admin />
            </div>
          )}
        </>
      )}
    </userContext.Consumer>
  );
}
