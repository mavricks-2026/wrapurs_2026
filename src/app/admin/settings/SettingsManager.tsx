"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/services/settings.service";
import { DEFAULT_SETTINGS } from "@/services/settings.service";

const COLOR_PRESETS = [
  { name: "WrapUrs Plum (Default)", brand: "#B96CB4", dark: "#854880", surface: "#FCF6FC" },
  { name: "Royal Emerald", brand: "#1F7A59", dark: "#14523B", surface: "#F4FAF6" },
  { name: "Blush Rose", brand: "#D95D7A", dark: "#A33750", surface: "#FDF5F7" },
  { name: "Sunset Terracotta", brand: "#C45A38", dark: "#8F3A20", surface: "#FAF5F2" },
  { name: "Midnight Navy", brand: "#284B63", dark: "#152E3E", surface: "#F3F7FA" },
  { name: "Warm Gold", brand: "#B37D28", dark: "#7E5414", surface: "#FCF8F2" },
];

const HERO_IMAGE_PRESETS = [
  { label: "Default Hero Keepsake", url: "/images/home/hero.jpg" },
  { label: "Glowing Heart Lamp", url: "/images/products/heart-photo-lamp.jpg" },
  { label: "Couple Eye Frame", url: "/images/products/couple-eye-frame.jpg" },
  { label: "Luxury Gift Hamper", url: "/images/products/luxury-chocolate-rose-hamper.jpg" },
];

export function SettingsManager({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<"hero" | "theme" | "announcement" | "contact">("hero");
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to upload image");
      }
      setSettings((prev) => ({
        ...prev,
        hero: { ...prev.hero, imageUrl: data.url },
      }));
      setMessage({ text: "Hero photo uploaded successfully!", type: "success" });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Upload failed",
        type: "error",
      });
    } finally {
      setUploadingHero(false);
      if (heroFileInputRef.current) {
        heroFileInputRef.current.value = "";
      }
    }
  }

  function handleThemeColor(preset: typeof COLOR_PRESETS[0]) {
    setSettings((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        brandColor: preset.brand,
        brandDarkColor: preset.dark,
        surfaceBg: preset.surface,
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      setMessage({ text: "All changes saved successfully! Storefront has been updated.", type: "success" });
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : "An error occurred while saving.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (confirm("Reset all settings to default configuration?")) {
      setSettings(DEFAULT_SETTINGS);
      setMessage({ text: "Settings reset to defaults. Click 'Save Changes' to apply.", type: "success" });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-line bg-white p-5 shadow-soft">
        <div>
          <h2 className="font-display text-[22px] font-bold text-plum">Storefront & Theme Controls</h2>
          <p className="text-[13.5px] text-plum-muted">
            Customize the main screen hero section, brand colors, announcement bar, and store contact info.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="rounded-full border border-line bg-section px-4 py-2 font-body text-[13.5px] font-bold text-plum transition-all hover:border-brand hover:text-brand"
          >
            View Live Store ↗
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-line px-4 py-2 font-body text-[13.5px] font-bold text-plum-muted hover:text-plum"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-brand px-6 py-2.5 font-body text-[14px] font-bold text-white shadow-soft transition-all hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? "Saving Changes…" : "Save All Changes"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-[14px] p-4 text-[14px] font-medium ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`rounded-full px-4 py-2 text-[14px] font-bold transition-all ${
            activeTab === "hero" ? "bg-brand text-white shadow-soft" : "text-plum-muted hover:bg-section hover:text-plum"
          }`}
        >
          Main Screen (Hero Section)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("theme")}
          className={`rounded-full px-4 py-2 text-[14px] font-bold transition-all ${
            activeTab === "theme" ? "bg-brand text-white shadow-soft" : "text-plum-muted hover:bg-section hover:text-plum"
          }`}
        >
          Theme & Brand Colors
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          className={`rounded-full px-4 py-2 text-[14px] font-bold transition-all ${
            activeTab === "announcement" ? "bg-brand text-white shadow-soft" : "text-plum-muted hover:bg-section hover:text-plum"
          }`}
        >
          Announcement Banner
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`rounded-full px-4 py-2 text-[14px] font-bold transition-all ${
            activeTab === "contact" ? "bg-brand text-white shadow-soft" : "text-plum-muted hover:bg-section hover:text-plum"
          }`}
        >
          Store Contact
        </button>
      </div>

      {/* Tab 1: Hero Section */}
      {activeTab === "hero" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <div className="rounded-[20px] border border-line bg-white p-6 shadow-soft">
              <h3 className="font-display text-[20px] font-bold text-plum">Hero Banner Content</h3>
              <p className="mt-1 text-[13px] text-plum-muted">
                This is the primary headline and visual that visitors see first on the homepage.
              </p>

              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-plum">Hero Headline</label>
                  <input
                    type="text"
                    value={settings.hero.title}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, title: e.target.value },
                      }))
                    }
                    className="mt-1.5 w-full rounded-[12px] border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-brand"
                    placeholder="Gifts Designed By You, Made With Love"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-plum">
                    Highlight Word(s) <span className="font-normal text-plum-muted">(styled in brand color)</span>
                  </label>
                  <input
                    type="text"
                    value={settings.hero.highlight}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, highlight: e.target.value },
                      }))
                    }
                    className="mt-1.5 w-full rounded-[12px] border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-brand"
                    placeholder="Love"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-plum">Subtitle / Tagline Description</label>
                  <textarea
                    rows={3}
                    value={settings.hero.subtitle}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, subtitle: e.target.value },
                      }))
                    }
                    className="mt-1.5 w-full rounded-[12px] border border-line p-3 text-[14px] outline-none focus:border-brand"
                    placeholder="Add your photo, your name, your story..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-bold text-plum">Primary Button Text</label>
                    <input
                      type="text"
                      value={settings.hero.primaryCtaLabel}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, primaryCtaLabel: e.target.value },
                        }))
                      }
                      className="mt-1.5 w-full rounded-[12px] border border-line px-3.5 py-2 text-[14px] outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-plum">Primary Button Link</label>
                    <input
                      type="text"
                      value={settings.hero.primaryCtaHref}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, primaryCtaHref: e.target.value },
                        }))
                      }
                      className="mt-1.5 w-full rounded-[12px] border border-line px-3.5 py-2 text-[14px] outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-bold text-plum">Secondary Button Text</label>
                    <input
                      type="text"
                      value={settings.hero.secondaryCtaLabel}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, secondaryCtaLabel: e.target.value },
                        }))
                      }
                      className="mt-1.5 w-full rounded-[12px] border border-line px-3.5 py-2 text-[14px] outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-plum">Secondary Button Link</label>
                    <input
                      type="text"
                      value={settings.hero.secondaryCtaHref}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, secondaryCtaHref: e.target.value },
                        }))
                      }
                      className="mt-1.5 w-full rounded-[12px] border border-line px-3.5 py-2 text-[14px] outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-bold text-plum">Hero Image</label>
                    <span className="text-[12px] text-plum-muted">Upload from files or enter URL</span>
                  </div>
                  <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={settings.hero.imageUrl}
                      placeholder="e.g. /images/home/hero.jpg or https://..."
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, imageUrl: e.target.value },
                        }))
                      }
                      className="flex-1 rounded-[12px] border border-line px-3.5 py-2 text-[14px] outline-none focus:border-brand"
                    />
                    <input
                      ref={heroFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeroUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingHero}
                      onClick={() => heroFileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-1.5 rounded-[12px] border border-brand bg-brand/10 px-4 py-2 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-white disabled:opacity-50"
                    >
                      {uploadingHero ? "Uploading…" : "📁 Upload Photo from Files"}
                    </button>
                  </div>
                  {settings.hero.imageUrl ? (
                    <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-line bg-section p-2.5">
                      <div className="relative h-14 w-20 overflow-hidden rounded-[8px] bg-white border border-line flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={settings.hero.imageUrl}
                          alt="Hero preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-[12px] text-plum">
                        <p className="font-semibold">Current hero image</p>
                        <p className="truncate text-plum-muted">{settings.hero.imageUrl}</p>
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
                    <span className="font-semibold text-plum-muted">Presets:</span>
                    {HERO_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, imageUrl: preset.url },
                          }))
                        }
                        className="rounded-full bg-section px-2.5 py-1 text-plum hover:bg-brand/10 hover:text-brand"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 rounded-[20px] border border-line bg-white p-5 shadow-card">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brand">Live Preview</span>
              <h4 className="mt-1 font-display text-[18px] font-bold text-plum">Homepage Hero Preview</h4>

              <div
                className="mt-4 overflow-hidden rounded-[18px] border border-line p-5 transition-colors"
                style={{ backgroundColor: settings.theme.surfaceBg }}
              >
                <div className="flex flex-col gap-3">
                  <h1 className="font-display text-[26px] font-bold leading-tight text-plum">
                    {settings.hero.title}
                  </h1>
                  <p className="font-body text-[13.5px] leading-relaxed text-plum-muted line-clamp-3">
                    {settings.hero.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span
                      className="rounded-full px-4 py-1.5 text-[12px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: settings.theme.brandColor }}
                    >
                      {settings.hero.primaryCtaLabel} →
                    </span>
                    <span className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[12px] font-bold text-plum">
                      {settings.hero.secondaryCtaLabel}
                    </span>
                  </div>

                  <div className="relative mt-2 h-44 w-full overflow-hidden rounded-t-[90px] rounded-b-[14px] border border-line bg-white shadow-soft">
                    <Image
                      src={settings.hero.imageUrl || "/images/home/hero.jpg"}
                      alt="Hero preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Theme & Colors */}
      {activeTab === "theme" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="rounded-[20px] border border-line bg-white p-6 shadow-soft">
              <h3 className="font-display text-[20px] font-bold text-plum">Brand Color Palette</h3>
              <p className="mt-1 text-[13px] text-plum-muted">
                Pick from curated designer palettes or select custom hex colors for the storefront.
              </p>

              {/* Preset chips */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = settings.theme.brandColor.toLowerCase() === preset.brand.toLowerCase();
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleThemeColor(preset)}
                      className={`flex flex-col items-start rounded-[14px] border p-3 text-left transition-all ${
                        isSelected ? "border-plum ring-2 ring-brand" : "border-line hover:border-brand/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.brand }} />
                        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.dark }} />
                        <span className="h-4 w-4 rounded-full border border-line" style={{ backgroundColor: preset.surface }} />
                      </div>
                      <span className="mt-2 text-[12.5px] font-bold text-plum">{preset.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom inputs */}
              <div className="mt-6 border-t border-line pt-6">
                <h4 className="text-[14px] font-bold text-plum">Custom Color Codes</h4>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12.5px] font-bold text-plum-muted">Primary Brand Color</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.theme.brandColor}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, brandColor: e.target.value },
                          }))
                        }
                        className="h-10 w-12 cursor-pointer rounded-lg border border-line p-0.5"
                      />
                      <input
                        type="text"
                        value={settings.theme.brandColor}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, brandColor: e.target.value },
                          }))
                        }
                        className="w-full rounded-[10px] border border-line px-3 py-2 font-mono text-[13px] outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-plum-muted">Brand Dark Accent</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.theme.brandDarkColor}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, brandDarkColor: e.target.value },
                          }))
                        }
                        className="h-10 w-12 cursor-pointer rounded-lg border border-line p-0.5"
                      />
                      <input
                        type="text"
                        value={settings.theme.brandDarkColor}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, brandDarkColor: e.target.value },
                          }))
                        }
                        className="w-full rounded-[10px] border border-line px-3 py-2 font-mono text-[13px] outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-plum-muted">Soft Surface Background</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.theme.surfaceBg}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, surfaceBg: e.target.value },
                          }))
                        }
                        className="h-10 w-12 cursor-pointer rounded-lg border border-line p-0.5"
                      />
                      <input
                        type="text"
                        value={settings.theme.surfaceBg}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, surfaceBg: e.target.value },
                          }))
                        }
                        className="w-full rounded-[10px] border border-line px-3 py-2 font-mono text-[13px] outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-plum-muted">Section Accent Background</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.theme.sectionBg}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, sectionBg: e.target.value },
                          }))
                        }
                        className="h-10 w-12 cursor-pointer rounded-lg border border-line p-0.5"
                      />
                      <input
                        type="text"
                        value={settings.theme.sectionBg}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, sectionBg: e.target.value },
                          }))
                        }
                        className="w-full rounded-[10px] border border-line px-3 py-2 font-mono text-[13px] outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 rounded-[20px] border border-line bg-white p-5 shadow-card">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brand">Palette Preview</span>
              <h4 className="mt-1 font-display text-[18px] font-bold text-plum">Store UI Element Swatches</h4>

              <div className="mt-4 flex flex-col gap-4">
                <div
                  className="rounded-[16px] p-5 border border-line"
                  style={{ backgroundColor: settings.theme.surfaceBg }}
                >
                  <span className="text-[12px] font-bold text-plum-muted">Surface Card Background</span>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-full px-5 py-2 text-[13px] font-bold text-white shadow-soft"
                      style={{ backgroundColor: settings.theme.brandColor }}
                    >
                      Primary Button
                    </button>
                    <button
                      type="button"
                      className="rounded-full px-5 py-2 text-[13px] font-bold text-white shadow-soft"
                      style={{ backgroundColor: settings.theme.brandDarkColor }}
                    >
                      Dark Button
                    </button>
                  </div>
                </div>

                <div
                  className="rounded-[16px] p-5 border border-line"
                  style={{ backgroundColor: settings.theme.sectionBg }}
                >
                  <span className="text-[12px] font-bold text-plum-muted">Section Accent Background</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider"
                      style={{ backgroundColor: settings.theme.brandColor }}
                    >
                      Bestseller
                    </span>
                    <span
                      className="rounded-full border px-3 py-1 text-[11px] font-bold"
                      style={{ borderColor: settings.theme.brandColor, color: settings.theme.brandColor }}
                    >
                      Handcrafted
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Announcement Banner */}
      {activeTab === "announcement" && (
        <div className="rounded-[20px] border border-line bg-white p-6 shadow-soft max-w-2xl">
          <h3 className="font-display text-[20px] font-bold text-plum">Top Announcement Bar</h3>
          <p className="mt-1 text-[13px] text-plum-muted">
            Display seasonal promotions, coupons, or free shipping announcements at the very top of every page.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement.enabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, enabled: e.target.checked },
                  }))
                }
                className="h-5 w-5 rounded text-brand focus:ring-brand"
              />
              <span className="text-[14px] font-bold text-plum">Enable Announcement Banner</span>
            </label>

            <div>
              <label className="block text-[13px] font-bold text-plum">Banner Text</label>
              <input
                type="text"
                value={settings.announcement.text}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, text: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-[12px] border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-brand"
                placeholder="✨ Free Personalized Gift Box on orders above ₹999 | Use code LOVE"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-plum">Target Link (Optional)</label>
              <input
                type="text"
                value={settings.announcement.link}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, link: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-[12px] border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-brand"
                placeholder="/shop"
              />
            </div>

            {/* Preview */}
            <div className="mt-4 border-t border-line pt-4">
              <span className="text-[12px] font-bold text-plum-muted">Banner Preview:</span>
              <div
                className="mt-2 rounded-[10px] p-2.5 text-center font-body text-[13px] font-semibold text-white"
                style={{ backgroundColor: settings.theme.brandColor }}
              >
                {settings.announcement.text || "Announcement text goes here"} →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Contact Info */}
      {activeTab === "contact" && (
        <div className="rounded-[20px] border border-line bg-white p-6 shadow-soft max-w-2xl">
          <h3 className="font-display text-[20px] font-bold text-plum">Store Contact Details</h3>
          <p className="mt-1 text-[13px] text-plum-muted">
            Update your business WhatsApp concierge, support email, and operating hours.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-bold text-plum">WhatsApp Concierge Number</label>
              <input
                type="text"
                value={settings.contact.whatsapp}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, whatsapp: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-[12px] border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-brand"
                placeholder="+91 90433 69943"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-plum">Customer Support Email</label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-[12px] border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-brand"
                placeholder="hello@wrapurs.com"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-plum">Operating Hours</label>
              <input
                type="text"
                value={settings.contact.hours}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, hours: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-[12px] border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-brand"
                placeholder="Mon – Sat, 10 AM – 7 PM IST"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
