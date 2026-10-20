"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CategoryAdminRow } from "@/services/category.service";

/**
 * CategoriesManager — client-side CRUD for /admin/categories.
 * Talks only to the /api/admin/categories routes, which verify the ADMIN
 * role server-side on every operation.
 */

type FormState = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  sortOrder: "0",
};

function toForm(row: CategoryAdminRow): FormState {
  return {
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    icon: row.icon ?? "",
    sortOrder: String(row.sortOrder),
  };
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "You are not authorized to manage categories.",
  duplicate_slug: "That slug is already in use by another category.",
  not_found: "That category no longer exists.",
  database_error: "The database could not complete the request. Try again.",
  invalid_body: "The request was not understood.",
};

function CategoryForm({
  initial,
  busy,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: FormState;
  busy: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (form: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [slugTouched, setSlugTouched] = useState(false);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => {
      if (key === "name" && !slugTouched) {
        return { ...prev, name: value, slug: slugify(value) };
      }
      return { ...prev, [key]: value };
    });
  }

  const inputClasses =
    "rounded-[12px] border border-line bg-white px-3 py-2 text-[14px] text-plum outline-none focus:border-brand";

  return (
    <form
      className="flex flex-col gap-3 rounded-[16px] border border-line bg-section/60 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-[12.5px] font-bold text-plum-muted">
          Name *
          <input
            className={inputClasses}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={120}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-[12.5px] font-bold text-plum-muted">
          Slug *
          <input
            className={inputClasses}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
            maxLength={120}
            placeholder="auto-from-name"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-[12.5px] font-bold text-plum-muted">
          Icon (Material Symbols name)
          <input
            className={inputClasses}
            value={form.icon}
            onChange={(e) => set("icon", e.target.value)}
            maxLength={64}
            placeholder="e.g. redeem"
          />
        </label>
        <label className="flex flex-col gap-1 text-[12.5px] font-bold text-plum-muted">
          Sort order
          <input
            className={inputClasses}
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", e.target.value)}
            inputMode="numeric"
          />
        </label>
        <label className="flex flex-col gap-1 text-[12.5px] font-bold text-plum-muted sm:col-span-2">
          Description
          <textarea
            className={`${inputClasses} min-h-[72px] resize-y`}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={1000}
          />
        </label>
      </div>

      {error ? <p className="text-[13px] font-semibold text-red-600">{error}</p> : null}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-brand px-5 py-2 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="rounded-full border border-line bg-white px-5 py-2 text-[13.5px] font-semibold text-plum transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: CategoryAdminRow[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(url: string, method: string, body?: FormState) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          payload.detail ??
            ERROR_MESSAGES[payload.error as string] ??
            "Something went wrong. Try again.",
        );
        return;
      }
      setCreating(false);
      setEditingId(null);
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleDelete(row: CategoryAdminRow) {
    if (!window.confirm(`Delete the category "${row.name}"? This cannot be undone.`)) return;
    void send(`/api/admin/categories/${row.id}`, "DELETE");
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        {!creating ? (
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditingId(null);
              setError(null);
            }}
            className="rounded-full bg-brand px-5 py-2 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            + New category
          </button>
        ) : (
          <CategoryForm
            initial={EMPTY_FORM}
            busy={busy}
            error={error}
            submitLabel="Create category"
            onSubmit={(form) => void send("/api/admin/categories", "POST", form)}
            onCancel={() => {
              setCreating(false);
              setError(null);
            }}
          />
        )}
      </div>

      <div className="overflow-x-auto rounded-[20px] border border-line bg-white shadow-soft">
        <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-line bg-section/60 text-[12px] uppercase tracking-wide text-plum-muted">
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Slug</th>
              <th className="px-4 py-3 font-bold">Sort</th>
              <th className="px-4 py-3 font-bold">Icon</th>
              <th className="px-4 py-3 font-bold">Description</th>
              <th className="px-4 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-plum-muted">
                  No categories found in the database.
                </td>
              </tr>
            ) : (
              initialCategories.map((row) =>
                editingId === row.id ? (
                  <tr key={row.id}>
                    <td colSpan={6} className="p-4">
                      <CategoryForm
                        initial={toForm(row)}
                        busy={busy}
                        error={error}
                        submitLabel="Save changes"
                        onSubmit={(form) =>
                          void send(`/api/admin/categories/${row.id}`, "PATCH", form)
                        }
                        onCancel={() => {
                          setEditingId(null);
                          setError(null);
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id} className="border-b border-line/60 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-plum">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-[12.5px] text-plum-muted">
                      {row.slug}
                    </td>
                    <td className="px-4 py-3 text-plum-muted">{row.sortOrder}</td>
                    <td className="px-4 py-3 text-plum-muted">{row.icon ?? "—"}</td>
                    <td className="max-w-[280px] truncate px-4 py-3 text-plum-muted">
                      {row.description ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(row.id);
                            setCreating(false);
                            setError(null);
                          }}
                          className="rounded-full border border-line px-3.5 py-1.5 text-[12.5px] font-semibold text-plum transition-colors hover:border-brand hover:text-brand"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          disabled={busy}
                          className="rounded-full border border-line px-3.5 py-1.5 text-[12.5px] font-semibold text-red-600 transition-colors hover:border-red-400 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
