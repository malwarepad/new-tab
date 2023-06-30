import Link from "next/link";
import Image from "next/image";

import MenuSvg from "../../assets/svg/menu.svg";
import { userContext } from "@/pages";

export default function Topbar() {
  return (
    <userContext.Consumer>
      {(user) => (
        <div className="flex flex-row items-center justify-end pt-4 pb-1.5">
          <Link className="mr-4 hover:underline" href="https://mail.google.com">
            Gmail
          </Link>
          <Link
            className="mr-6 hover:underline"
            href="https://www.google.com/imghp"
          >
            Images
          </Link>
          <div className="mr-6">
            <Image src={MenuSvg} alt="Menu icon" draggable={false} />
          </div>
          <div className="mr-4">
            <Image
              src={
                user?.UserSettings?.find((o) => o.key === "ProfileUrl")
                  ?.value || "https://raw.malwarepad.com/logo/user.png"
              }
              width={32}
              height={32}
              className="w-[32px] rounded-full aspect-square"
              alt="Account"
            />
          </div>
        </div>
      )}
    </userContext.Consumer>
  );
}
