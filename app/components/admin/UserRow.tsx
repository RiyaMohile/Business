"use client";

import RoleBadge from "./RoleBadge";
import UserActionButton from "./UserActionButton";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  username: string;
  phoneNumber?: string;
  isAdmin: boolean;
}

interface Props {
  user: User;
  onRefresh: () => void;
}
export default function UserRow({
  user,
  onRefresh,
}: Props) {
  const router = useRouter();
  return (
    <tr
  onClick={() => router.push(`/admins/users/view?id=${user._id}`)}
  className="hover:bg-gray-50 cursor-pointer"
>

      <td className="p-4">{user.name}</td>

      <td>
  <Link
    href={`/admins/users/view?id=${user._id}`}
    className="text-blue-600 hover:underline font-medium"
  >
    {user.username}
  </Link>
</td>

      <td>{user.phoneNumber || "-"}</td>

      <td className="text-center">
        <RoleBadge isAdmin={user.isAdmin} />
      </td>

      <td className="text-center">
        <UserActionButton
          id={user._id}
          isAdmin={user.isAdmin}
          onRefresh={onRefresh}
        />
      </td>

    </tr>
  );
}