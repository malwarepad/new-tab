import Image from "next/image";
import { LinkType } from "../../types";
import Link from "next/link";
import PlusSvg from "../../assets/svg/plus.svg";
import DotsSvg from "../../assets/svg/dots.svg";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import DialogEdit from "../reusable/dialogEdit";

import { useCookies } from "react-cookie";
import { userContext } from "@/pages";
import Dialog from "../reusable/dialog";

export default function Links({ children }: { children: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-5 max-custom2:grid-cols-4 max-custom3:grid-cols-3 max-custom4:grid-cols-2">
        {children}
        <LinkComponent
          icon={PlusSvg}
          id={-1}
          label="Add shortcut"
          uri=""
          noOptions
          onClick={() => setDialogOpen(true)}
        />
      </div>
      {dialogOpen && <Dialog setDialogOpen={setDialogOpen} />}
    </>
  );
}

export function LinkComponent({
  icon,
  label,
  uri,
  onClick,
  id,
  noOptions,
  index,
}: LinkType) {
  const [optionHandler, setOptionHandler] = useState(false);
  const [options, setOptions] = useState(false);
  const [timeout, setTimeoutVar] = useState<NodeJS.Timeout>();
  const [editorOpen, setEditOpen] = useState(false);
  const [token, setToken] = useCookies(["token"]);

  const router = useRouter();

  const handleRemove = async () => {
    const request = await axios
      .delete(`/api/links/manage?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token.token}`,
        },
      })
      .catch((e: AxiosError) => e.response);

    if (!request?.data?.success) return;
    setOptions(false);
    router.replace(router.asPath);
  };

  const handleLeft = async () => {
    const request = await axios
      .patch(
        `/api/links/manage`,
        { id, left: true },
        {
          headers: {
            Authorization: `Bearer ${token.token}`,
          },
        }
      )
      .catch((e) => undefined);
    if (request?.data?.success) router.replace(router.asPath);
  };
  const handleRight = async () => {
    const request = await axios
      .patch(
        `/api/links/manage`,
        { id, left: false },
        {
          headers: {
            Authorization: `Bearer ${token.token}`,
          },
        }
      )
      .catch((e) => undefined);
    if (request?.data?.success) router.replace(router.asPath);
  };

  useEffect(() => {
    if (!options) clearTimeout(timeout);
  }, [options]);

  return (
    <userContext.Consumer>
      {(user) => (
        <>
          <Link
            href={options ? "" : uri}
            passHref
            className={`flex items-center flex-col justify-center hover:bg-[var(--bg-color)] rounded relative`}
            style={
              {
                "--bg-color":
                  user?.UserSettings.find((o) => o.key === "FocusColor")
                    ?.value || "#4a4a4e",
              } as any
            }
            onMouseOver={() =>
              setTimeoutVar(setTimeout(() => setOptionHandler(true), 500))
            }
            onMouseOut={() => {
              clearTimeout(timeout);
              setOptionHandler(false);
            }}
            onClick={onClick || (() => {})}
          >
            <div className="bg-[#202124] p-3 rounded-full my-4 aspect-square">
              <Image
                src={icon}
                width={25}
                height={25}
                alt=""
                className="w-[25px] aspect-square"
                draggable={false}
              />
            </div>
            <div className="mb-[20px]">{label}</div>
            {!noOptions && (
              <form
                className="inline"
                onSubmit={(e) => {
                  e.preventDefault();
                  setOptions(true);
                }}
              >
                <button
                  className={`absolute top-0 right-0 m-1.5 transition-all ${
                    optionHandler ? "opacity-100" : "opacity-0"
                  } hover:!opacity-100 rounded-full p-0.5 aspect-square hover:bg-[#5c5c60]`}
                >
                  <Image
                    src={DotsSvg}
                    alt="Options"
                    className="w-5"
                    draggable={false}
                  />
                </button>
              </form>
            )}
            {options && (
              <div className="absolute top-0 left-0 w-full bg-[#2d2e31] py-2 rounded shadow-2xl z-40">
                <div
                  className="px-5 py-2 hover:bg-[#5f6368]"
                  onClick={() => {
                    setOptions(false);
                    setEditOpen(true);
                  }}
                >
                  Edit shortcut
                </div>
                <div
                  className="px-5 py-2 hover:bg-[#5f6368] cursor-pointer"
                  onClick={handleRemove}
                >
                  Remove
                </div>
                <div
                  className="px-5 py-2 hover:bg-[#5f6368] cursor-pointer"
                  onClick={handleLeft}
                >
                  Move left
                </div>
                <div
                  className="px-5 py-2 hover:bg-[#5f6368] cursor-pointer"
                  onClick={handleRight}
                >
                  Move right
                </div>
              </div>
            )}
            {options && !editorOpen && (
              <div
                className="fixed top-0 right-0 z-10 w-screen h-screen cursor-default"
                onClick={() => setOptions(false)}
              />
            )}
          </Link>
          {editorOpen && (
            <DialogEdit
              setDialogOpen={setEditOpen}
              link={{ icon, id, label, uri }}
            />
          )}
        </>
      )}
    </userContext.Consumer>
  );
}
