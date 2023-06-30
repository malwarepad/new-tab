import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { useCookies } from "react-cookie";

export const TextField =
  "w-96 rounded focus:outline-none text-black mt-1 px-2 py-1 border-2 border-transparent focus:border-neutral-500 focus:rounded-lg transition-all";

export function Label({ children }: { children: string }) {
  return <div className="text-neutral-400 text-sm">{children}</div>;
}

export default function Dialog({
  setDialogOpen,
}: {
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const [label, setLabel] = useState("");
  const [uri, setUri] = useState("");
  const [file, setFile] = useState<File>();
  const [token, setToken] = useCookies(["token"]);

  const [error, setError] = useState("");

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData();
    form.append("label", label);
    form.append("uri", uri);
    form.append("file", file as Blob);

    const request = await axios
      .post("/api/links", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.token}`,
        },
      })
      .catch((e: AxiosError) => e.response);

    if (request?.data?.success) {
      router.replace(router.asPath);
      setDialogOpen(false);
      return;
    }
    setError(request?.data?.msg);
  };
  return (
    <div className="absolute top-0 left-0 w-screen h-screen p-0 m-0 flex flex-row items-center justify-center z-10 bg-neutral-950/80">
      <form
        onSubmit={handleFormSubmit}
        className="bg-[#28292c] shadow-xl p-5 rounded-2xl flex flex-col gap-4"
      >
        <div className="text-xl">Add shortcut</div>
        <div>
          <Label>Label</Label>
          <input
            className={TextField}
            value={label}
            onChange={(e) => setLabel(e?.target?.value || "")}
          />
        </div>
        <div>
          <Label>URL</Label>
          <input
            className={TextField}
            value={uri}
            onChange={(e) => setUri(e?.target?.value || "")}
          />
        </div>
        <div>
          <input
            type="file"
            onChange={(e) =>
              e?.target?.files && (e?.target?.files?.length || 0) > 0
                ? setFile(e.target.files[0])
                : undefined
            }
          />
        </div>
        {error && (
          <div className="text-red-500 text-center text-md">{error}</div>
        )}
        <div className="flex flex-row flex-wrap justify-end items-center gap-2 mt-2">
          <button
            type="button"
            className="px-4 py-2 border border-red-500 rounded-xl hover:bg-red-400/25 transition-all font-medium"
            onClick={() => setDialogOpen(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border rounded-xl border-green-500 hover:bg-green-400/25 transition-all font-medium"
          >
            Done
          </button>
        </div>
      </form>
    </div>
  );
}
