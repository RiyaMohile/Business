"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import UserTable from "../components/admin/UserTable";
import SearchUser from "../components/admin/SearchUser";
import api from "../services/api";

interface User {
  _id: string;
  name: string;
  username: string;
  phoneNumber?: string;
  isAdmin: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/user/all-users");

      setUsers(data.users);
    } catch (err) {
      console.log(err);
      alert("Unable to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!search.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.get(
        `/user/search?username=${search}`
      );

      setUsers(data.users);
    } catch (err) {
      console.log(err);
      alert("Unable to search users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <main className="ml-0 md:ml-72 flex-1 h-screen overflow-hidden px-4 pb-6 pt-20 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold">
          Admin Management
        </h1>

        <p className="text-gray-500 mt-2">
          Promote or remove admins.
        </p>

        <SearchUser
          value={search}
          onChange={setSearch}
          onSearch={searchUsers}
        />

        <UserTable
          users={users}
          loading={loading}
          onRefresh={fetchUsers}
        />

      </main>

    </div>
  );
}