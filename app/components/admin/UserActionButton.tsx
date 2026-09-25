"use client";

import { UserMinus, UserPlus } from "lucide-react";
import api from "../../services/api";

interface Props {
  id: string;
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function UserActionButton({
  id,
  isAdmin,
  onRefresh,
}: Props) {
  const updateRole = async () => {
    try {
      await api.post(
        isAdmin
          ? "/admin/remove-admin"
          : "/admin/make-admin",
        {
          userId: id,
        }
      );

      alert(
        isAdmin
          ? "Admin removed successfully"
          : "User promoted to Admin"
      );

      onRefresh();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  return isAdmin ? (
    <button
      onClick={updateRole}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
    >
      <UserMinus size={16} />
      Remove Admin
    </button>
  ) : (
    <button
      onClick={updateRole}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
    >
      <UserPlus size={16} />
      Make Admin
    </button>
  );
}