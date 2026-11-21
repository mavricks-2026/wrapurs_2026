"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import type { CategoryAdminRow } from "@/services/category.service";
import type { ProductAdminRow, ProductImageInput } from "@/services/product-admin.service";

/**
 * ProductsManager — client-side CRUD for /admin/products.
 * Talks only to the /api/admin/products routes, which verify the ADMIN
 * role server-side on every operation. Image entries are path/URL strings
 * (files under /public or full https URLs) — no upload service.
 *
 * Only type-only imports from admin services: importing a value (e.g.
 * PRODUCT_STATUSES) would pull next/cache and Prisma into the client bundle
 * and break the build (same rule as CategoriesManager).
 */

const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

type FormState = {
  title: string;
  slug: string;
  description: string;
  priceInr: string;
  compareAtInr: string;
  status: string;
  categoryIds: string[];
  images: (ProductImageInput & { key: number })[];
  /** Comma-separated tag tokens; split on submit. */
  tags: string;
  isFeatured: boolean;
  /** String so the input can be blank; converted to number | null on submit. */
  homeOrder: string;
  badge: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  description: "",
  priceInr: "",
  compareAtInr: "",
  status: "DRAFT",
  categoryIds: [],
  images: [],
  tags: "",
  isFeatured: false,
  homeOrder: "",
  badge: "",
};

let imageKey = 0;

function toForm(row: ProductAdminRow): FormState {
  return {
    title: row.title,
    slug: row.slug,
    description: row.description,
    priceInr: String(row.priceInr),
    compareAtInr: row.compareAtInr === null ? "" : String(row.compareAtInr),
    status: row.status,
    categoryIds: row.categories.map((category) => category.id),
    images: row.images.map((image) => ({
      key: imageKey++,
      url: image.url,
      alt: image.alt,
      isPrimary: image.isPrimary,
    })),
    tags: row.tags.join(", "),
    isFeatured: row.isFeatured,
    homeOrder: row.homeOrder === null ? "" : String(row.homeOrder),
    badge: row.badge ?? "",
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

function toPayload(form: FormState) {
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const homeOrder = form.homeOrder.trim() === "" ? null : Number(form.homeOrder);

  return {
    title: form.title,
    slug: form.slug,
    description: form.description,
    priceInr: form.priceInr,
    compareAtInr: form.compareAtInr,
    status: form.status,
    categoryIds: form.categoryIds,
    images: form.images.map(({ url, alt, isPrimary }) => ({ url, alt, isPrimary })),
    tags,
    isFeatured: form.isFeatured,
    homeOrder,
    badge: form.badge.trim(),
  };
}

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "You are not authorized to manage products.",
  duplicate_slug: "That slug is already in use by another product.",
  not_found: "That product no longer exists.",
  database_error: "The database could not complete the request. Try again.",
  invalid_body: "The request was not understood.",
};

const inputClasses =
  "rounded-[12px] border border-line bg-white px-3 py-2 text-[14px] text-plum outline-none focus:border-brand";

function ProductForm({
  initial,
  categories,
  busy,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: FormState;
  categories: CategoryAdminRow[];
  busy: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (form: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.message || data.error || "Upload failed");
        }

        setForm((prev) => {
          const isFirst = prev.images.length === 0;
          return {
            ...prev,
            images: [
              ...prev.images,
              {
                key: imageKey++,
                url: data.url,
                alt: file.name.replace(/\.[^/.]+$/, ""),
                isPrimary: isFirst,
              },
            ],
          };
        });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function set(key: keyof FormState, value: string) {
    setForm((prev) => {
      if (key === "title" && !slugTouched) {
        return { ...prev, title: value, slug: slugify(value) };
      }
      return { ...prev, [key]: value };
    });
  }

  function setFeatured(value: boolean) {
    setForm((prev) => ({ ...prev, isFeatured: value }));
  }

  function toggleCategory(id: string) {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((existing) => existing !== id)
        : [...prev.categoryIds, id],
    }));
  }

  function updateImage(key: number, patch: Partial<FormState["images"][number]>) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((image) => (image.key === key ? { ...image, ...patch } : image)),
    }));
  }

  function removeImage(key: number) {
    setForm((prev) => {
      const images = prev.images.filter((image) => image.key !== key);
      if (images.length > 0 && !images.some((image) => image.isPrimary)) {
        images[0].isPrimary = true;
      }
      return { ...prev, images };
    });
  }

  function addImage() {
    setForm((prev) => ({
      ...prev,
      images: [
        ...prev.images.map((image, index) => ({ ...image, isPrimary: index === 0 })),
        { key: imageKey++, url: "", alt: "", isPrimary: prev.images.length === 0 },
      ],
    }));
  }

  const labelClasses = "flex flex-col gap-1 text-[12.5px] font-bold text-plum-muted";

  return (
    <form
      className="flex flex-col gap-4 rounded-[16px] border border-line bg-section/60 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClasses}>
          Title *
          <input
            className={inputClasses}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={200}
            required
          />
        </label>
        <label className={labelClasses}>
          Slug *
          <input
            className={inputClasses}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
            maxLength={200}
            placeholder="auto-from-title"
            required
          />
        </label>
        <label className={`${labelClasses} sm:col-span-2`}>
          Description *
          <textarea
            className={`${inputClasses} min-h-[80px] resize-y`}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={2000}
            required
          />
        </label>
        <label className={labelClasses}>
          Price (₹) *
          <input
            className={inputClasses}
            value={form.priceInr}
            onChange={(e) => set("priceInr", e.target.value)}
            inputMode="numeric"
            placeholder="e.g. 499"
            required
          />
        </label>
        <label className={labelClasses}>
          Compare-at price (₹, optional)
          <input
            className={inputClasses}
            value={form.compareAtInr}
            onChange={(e) => set("compareAtInr", e.target.value)}
            inputMode="numeric"
            placeholder="MRP shown struck-through"
          />
        </label>
        <label className={labelClasses}>
          Status *
          <select
            className={inputClasses}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            {PRODUCT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClasses}>
          Badge (optional)
          <input
            className={inputClasses}
            value={form.badge}
            onChange={(e) => set("badge", e.target.value)}
            maxLength={40}
            placeholder='Ribbon text, e.g. "Bestseller"'
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-3 rounded-[14px] border border-line bg-white/70 p-3">
        <legend className="px-1 text-[12.5px] font-bold text-plum-muted">
          Storefront presentation
        </legend>
        <label className={labelClasses}>
          Tags (comma-separated)
          <input
            className={inputClasses}
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="trending, birthday, everyday"
          />
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[12.5px] font-bold text-plum-muted">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Feature on Home (Trending)
          </label>
          <label className={`${labelClasses} w-40`}>
            Home order
            <input
              className={inputClasses}
              value={form.homeOrder}
              onChange={(e) => set("homeOrder", e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 1"
            />
          </label>
        </div>
        <p className="text-[11.5px] text-plum-muted">
          Featured products appear on the Home rail after the built-in keepsakes, ordered by
          Home order (lower first). Tags drive the shop, collection and search filters.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[12.5px] font-bold text-plum-muted">Categories</legend>
        {categories.length === 0 ? (
          <p className="text-[13px] text-plum-muted">No categories exist yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const checked = form.categoryIds.includes(category.id);
              return (
                <label
                  key={category.id}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    checked
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-white text-plum hover:border-brand hover:text-brand"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleCategory(category.id)}
                  />
                  {category.name}
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-[14px] border border-line bg-white/70 p-3">
        <legend className="px-1 text-[12.5px] font-bold text-plum-muted">
          Product Images (Upload photo files directly or provide URL)
        </legend>
        {form.images.map((image) => (
          <div key={image.key} className="flex flex-wrap items-center gap-2.5 rounded-[12px] border border-line bg-white p-2">
            {image.url ? (
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[8px] border border-line bg-section">
                <img
                  src={image.url}
                  alt={image.alt || "Product image"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            ) : null}
            <input
              className={`${inputClasses} flex-1 min-w-[200px]`}
              value={image.url}
              placeholder="/uploads/… or /images/products/…"
              onChange={(e) => updateImage(image.key, { url: e.target.value })}
              maxLength={500}
            />
            <input
              className={`${inputClasses} w-36`}
              value={image.alt ?? ""}
              placeholder="Alt text"
              onChange={(e) => updateImage(image.key, { alt: e.target.value })}
              maxLength={200}
            />
            <label className="flex items-center gap-1.5 text-[12.5px] font-bold text-plum-muted cursor-pointer">
              <input
                type="radio"
                name="primary-image"
                checked={image.isPrimary}
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    images: prev.images.map((candidate) => ({
                      ...candidate,
                      isPrimary: candidate.key === image.key,
                    })),
                  }))
                }
              />
              Primary
            </label>
            <button
              type="button"
              onClick={() => removeImage(image.key)}
              className="rounded-full border border-line bg-white px-3 py-1 text-[12px] font-semibold text-red-600 hover:border-red-400"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full bg-brand px-4 py-1.5 text-[12.5px] font-bold text-white shadow-soft transition-colors hover:bg-brand-dark disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>📁 {uploading ? "Uploading Image…" : "Upload Photo from Files"}</span>
          </button>
          <button
            type="button"
            onClick={addImage}
            className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-plum transition-colors hover:border-brand hover:text-brand"
          >
            + Add URL Manually
          </button>
        </div>
      </fieldset>

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

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  DRAFT: "bg-amber-100 text-amber-800",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

export function ProductsManager({
  initialProducts,
  categories,
}: {
  initialProducts: ProductAdminRow[];
  categories: CategoryAdminRow[];
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
        body: body ? JSON.stringify(toPayload(body)) : undefined,
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

  function handleDelete(row: ProductAdminRow) {
    if (!window.confirm(`Delete the product "${row.title}"? This cannot be undone.`)) return;
    void send(`/api/admin/products/${row.id}`, "DELETE");
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
            + New product
          </button>
        ) : (
          <ProductForm
            initial={EMPTY_FORM}
            categories={categories}
            busy={busy}
            error={error}
            submitLabel="Create product"
            onSubmit={(form) => void send("/api/admin/products", "POST", form)}
            onCancel={() => {
              setCreating(false);
              setError(null);
            }}
          />
        )}
      </div>

      <div className="overflow-x-auto rounded-[20px] border border-line bg-white shadow-soft">
        <table className="w-full min-w-[760px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-line bg-section/60 text-[12px] uppercase tracking-wide text-plum-muted">
              <th className="px-4 py-3 font-bold">Title</th>
              <th className="px-4 py-3 font-bold">Slug</th>
              <th className="px-4 py-3 font-bold">Price</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Categories</th>
              <th className="px-4 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-plum-muted">
                  No products found.
                </td>
              </tr>
            ) : (
              initialProducts.map((row) =>
                editingId === row.id ? (
                  <tr key={row.id}>
                    <td colSpan={6} className="p-4">
                      <ProductForm
                        initial={toForm(row)}
                        categories={categories}
                        busy={busy}
                        error={error}
                        submitLabel="Save changes"
                        onSubmit={(form) => void send(`/api/admin/products/${row.id}`, "PATCH", form)}
                        onCancel={() => {
                          setEditingId(null);
                          setError(null);
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id} className="border-b border-line/60 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-plum">{row.title}</td>
                    <td className="px-4 py-3 font-mono text-[12.5px] text-plum-muted">{row.slug}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-plum">
                      ₹{row.priceInr.toLocaleString("en-IN")}
                      {row.compareAtInr !== null ? (
                        <span className="ml-1.5 text-[12px] text-plum-muted line-through">
                          ₹{row.compareAtInr.toLocaleString("en-IN")}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                          STATUS_STYLES[row.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="max-w-[220px] px-4 py-3 text-[12.5px] text-plum-muted">
                      {row.categories.length > 0
                        ? row.categories.map((category) => category.name).join(", ")
                        : "—"}
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
