import { userContext } from "@/pages";
import Image from "next/image";

import CloseSvg from "../../assets/svg/close.svg";
import { useEffect, useState } from "react";
import { Invitation, User } from "@/types";
import axios, { AxiosError } from "axios";
import { useCookies } from "react-cookie";
import Router from "next/router";
import copy from "copy-to-clipboard";

export default function Admin() {
  const [users, setUsers] = useState<User[]>();
  const [invitations, setInvitations] = useState<Invitation[]>();
  const [token, setToken] = useCookies(["token"]);
  const [refreshInvites, setRefreshInvites] = useState(0);
  useEffect(() => {
    (async () => {
      const request = await axios
        .get("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token.token}`,
          },
        })
        .catch((e: AxiosError) => undefined);
      if (request?.data?.success) setUsers(request?.data?.users);

      const request2 = await axios
        .get("/api/admin/invites", {
          headers: {
            Authorization: `Bearer ${token.token}`,
          },
        })
        .catch((e: AxiosError) => undefined);
      if (request2?.data?.success) setInvitations(request2?.data?.invites);
    })();
  }, [refreshInvites]);
  const handleUserInvitation = async () => {
    const request = await axios
      .post(
        "/api/admin/users",
        {},
        {
          headers: {
            Authorization: `Bearer ${token.token}`,
          },
        }
      )
      .catch((e: AxiosError) => undefined);
    if (request?.data?.success) setRefreshInvites((prev) => prev + 1);
  };
  const handleDisable = async (id: number) => {
    const request = await axios
      .delete(`/api/admin/invites?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token.token}`,
        },
      })
      .catch(() => undefined);
    if (request?.data?.success) setRefreshInvites((prev) => prev + 1);
  };
  const handleUserDeletion = async (id: number) => {
    const request = await axios
      .delete(`/api/admin/users?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token.token}`,
        },
      })
      .catch(() => undefined);
    if (request?.data?.success) setRefreshInvites((prev) => prev + 1);
  };
  return (
    <userContext.Consumer>
      {(user) => (
        <>
          {(user?.role || 0) >= 3 ? (
            <div className="bg-[#202124] h-full py-3 px-5 flex flex-col gap-2">
              <h1 className="text-xl">Administrative settings</h1>
              <div className="flex flex-col gap-1">
                <div className="flex flex-col">
                  <div className="text-md underline">Users</div>
                  <table>
                    <thead>
                      <tr className="[&>th]:text-start">
                        <th>ID</th>
                        <th>Creation Date</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{new Date(item.createdAt).toLocaleString()}</td>
                          <td>{item.username}</td>
                          <td>{item.role}</td>
                          <td>
                            {item.id !== user?.id && (
                              <button
                                onClick={() => handleUserDeletion(item.id)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 transition-all rounded"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col">
                  <div className="text-md underline">Invitations</div>
                  <table>
                    <thead>
                      <tr className="[&>th]:text-start">
                        <th>ID</th>
                        <th>Token</th>
                        <th>Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations?.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td className="blur hover:blur-0 transition-all">
                            {item.token}
                          </td>
                          <td>{item.active ? "True" : "False"}</td>
                          <td className="flex flex-wrap gap-1">
                            {item.active && (
                              <>
                                <button
                                  onClick={() =>
                                    copy(
                                      `${window.location.href}welcome?token=${item.token}`
                                    )
                                  }
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 transition-all rounded"
                                >
                                  Copy
                                </button>
                                <button
                                  onClick={() => handleDisable(item.id)}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 transition-all rounded"
                                >
                                  Disable
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <button
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 transition-all rounded"
                    onClick={handleUserInvitation}
                  >
                    Invite user
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#202124] h-full py-3 px-5 flex flex-col gap-2">
              <h1 className="text-xl">Administrative settings</h1>
              <div className="flex flex-row gap-1 items-center">
                <Image src={CloseSvg} alt="" />
                <h2 className="text-md">Off-limits!</h2>
              </div>
              <div>
                Your role is {user?.role}, but this page is only allowed for
                role 3 users!
              </div>
            </div>
          )}
        </>
      )}
    </userContext.Consumer>
  );
}
