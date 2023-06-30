import Image from "next/image";
import Links, { LinkComponent } from "../design/links";

import GoogleSvg from "../../assets/svg/google.svg";
import SearchSvg from "../../assets/svg/search.svg";
import { LinkType } from "@/types";
import { Roboto } from "next/font/google";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { userContext } from "@/pages";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

export default function Mainarea({ links }: { links: LinkType[] }) {
  const [search, setSearch] = useState<string>();
  const router = useRouter();
  const handleGoogleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!search) return;
    router.push(
      `https://www.google.com/search?q=${search.replaceAll(" ", "+")}`
    );
  };
  return (
    <userContext.Consumer>
      {(user) => (
        <div className="flex flex-col items-center mb-auto">
          <div className="mt-[6.875rem] mb-[38px]">
            <Image
              src={GoogleSvg}
              alt="Google logo"
              draggable={false}
              className="brightness-0 invert"
            />
          </div>
          <form
            className="w-[36rem] max-custom:w-full max-custom:px-2 relative mb-4"
            onSubmit={handleGoogleSearch}
          >
            <input
              className={`w-full text-black placeholder:text-[#5f6368] py-3 pl-12 rounded-3xl focus:outline-none ${roboto.className} text-[16px]`}
              style={{
                background:
                  user?.UserSettings?.find((o) => o.key === "SearchColor")
                    ?.value || "#ffffff",
              }}
              placeholder="Search Google or type a URL"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="absolute top-0 h-full flex items-center left-4">
              <Image src={SearchSvg} alt="Search icon" draggable={false} />
            </button>
          </form>
          <div className="w-[36rem] max-custom:w-full">
            <Links>
              {links.map((link, index) => (
                <LinkComponent {...link} key={link.id} index={index} />
              ))}
            </Links>
          </div>
        </div>
      )}
    </userContext.Consumer>
  );
}
