"use client";

import { useEffect, useState } from "react";
import {
  Search,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/users");

      if (!res.ok) {
        throw new Error("Failed to load users");
      }

      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : data.users || [];

      setUsers(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus = !user.isActive;

    const confirmed = window.confirm(
      `${newStatus ? "Activate" : "Deactivate"} this user?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          isActive: newStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to update user"
        );
      }

      await loadUsers();
    } catch (error: any) {
      alert(error.message || "Something went wrong.");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    const name = `${user.firstName || ""} ${
      user.lastName || ""
    }`.toLowerCase();

    const email = user.email?.toLowerCase() || "";
    const phone = user.phone?.toLowerCase() || "";

    return (
      name.includes(value) ||
      email.includes(value) ||
      phone.includes(value)
    );
  });

  return (
    <>
      <header className="admin-header">
        <div>
          <h1>Users</h1>
          <p>
            Manage registered Trust Chain users.
          </p>
        </div>
      </header>

      <div className="container-app">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Registered Users</h2>
              <p>
                View and manage all users on the platform.
              </p>
            </div>

            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <Users size={40} />
              <h3>No users found</h3>
              <p>
                There are no registered users matching your
                search.
              </p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="client-cell">
                          <strong>
                            {user.firstName || ""}{" "}
                            {user.lastName || ""}
                          </strong>

                          <small>
                            ID: {user._id}
                          </small>
                        </div>
                      </td>

                      <td>
                        {user.email || "—"}
                      </td>

                      <td>
                        {user.phone || "—"}
                      </td>

                      <td>
                        <span className="role-badge">
                          {user.role || "user"}
                        </span>
                      </td>

                      <td>
                        {formatDate(user.createdAt)}
                      </td>

                      <td>
                        {user.isActive !== false ? (
                          <span className="status status-approved">
                            <UserCheck size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="status status-declined">
                            <UserX size={14} />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`btn ${
                            user.isActive !== false
                              ? "btn-danger"
                              : "btn-primary"
                          }`}
                          onClick={() =>
                            toggleUserStatus(user)
                          }
                        >
                          {user.isActive !== false
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}