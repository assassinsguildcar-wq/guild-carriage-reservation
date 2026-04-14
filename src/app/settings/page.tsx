"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchMembers = async () => {
    const res = await fetch("/api/members");
    const data = await res.json();

    if (Array.isArray(data.members)) {
      setMembers(data.members);
    }
  };

  const addMember = async () => {
    if (!name.trim()) return;

    await fetch("/api/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    setName("");
    fetchMembers();
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const deleteMember = async (id: string) => {
    const ok = confirm("Are you sure you want to delete?");
    if (!ok) return;

    const res = await fetch(`/api/members/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete");
      return;
    }

    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const saveEdit = async (id: string) => {
    if (!editingName.trim()) return;

    const res = await fetch(`/api/members/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: editingName }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to update");
      return;
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: editingName } : m))
    );
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-wide text-amber-400">
            Manage Members
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Add, edit, or delete guild members.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-neutral-900/80 p-6 shadow-xl">
       

          <div className="mb-6 flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter member name"
              className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-amber-400"
            />
            <button
              onClick={addMember}
              className="rounded-xl bg-amber-500 px-5 py-3 font-medium text-black hover:bg-amber-400"
            >
              Add
            </button>
          </div>

          <ul className="space-y-3">
            {members.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4"
              >
                {editingId === m.id ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(m.id)}
                        className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                        className="rounded-lg bg-neutral-700 px-4 py-2 text-white hover:bg-neutral-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-lg text-neutral-100">{m.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(m.id, m.name)}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-black hover:bg-amber-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMember(m.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}