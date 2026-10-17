"use client";

import { useRef } from "react";
import type { LedColor } from "@/config/product-details";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * PersonalizeCard — the "Personalize Your Keepsake" panel: photo upload,
 * name/message with a live character counter, optional LED colour swatches,
 * layout notes and the simulated-carving preview trigger.
 */
export function PersonalizeCard({
  photoName,
  onPhotoSelect,
  name,
  onNameChange,
  maxNameLength = 24,
  ledColors,
  ledColor,
  onLedColorChange,
  notes,
  onNotesChange,
  onPreview,
}: {
  photoName?: string;
  onPhotoSelect: (fileName: string) => void;
  name: string;
  onNameChange: (value: string) => void;
  maxNameLength?: number;
  ledColors?: LedColor[];
  ledColor?: string;
  onLedColorChange: (name: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onPreview: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h2 className="flex items-center gap-2 font-body text-[17px] font-bold text-plum">
          <Icon name="auto_fix_high" className="text-[22px] text-brand" />
          Personalize Your Keepsake
        </h2>
        <span className="font-body text-[12px] font-semibold text-brand">Step 1 of 2</span>
      </div>

      {/* 1. Upload photo */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center justify-between font-body text-[14px] font-bold text-plum">
          <span>
            1. Upload your photo for laser etching <span className="text-brand">*</span>
          </span>
          <span className="text-[12px] font-normal text-plum-muted">
            Clear portrait recommended
          </span>
        </label>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] bg-surface px-4 py-6 text-center transition-colors hover:bg-section"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-section text-brand">
            <Icon name="cloud_upload" className="text-[26px]" />
          </span>
          <span className="font-body text-[14px] font-semibold text-plum">
            Click to browse{" "}
            <span className="font-normal text-plum-muted">or drag and drop your photo</span>
          </span>
          <span className="font-body text-[12px] text-plum-muted">
            Supports JPG, PNG up to 10 MB. We review every crop manually before carving.
          </span>
          {photoName ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-body text-[12px] font-semibold text-brand-dark shadow-soft">
              <Icon name="check_circle" className="text-[14px]" />
              Selected: {photoName}
            </span>
          ) : null}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPhotoSelect(file.name);
          }}
        />
      </div>

      {/* 2. Name / message */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="gift-name"
          className="flex items-center justify-between font-body text-[14px] font-bold text-plum"
        >
          <span>
            2. Names or commemorative message <span className="text-brand">*</span>
          </span>
          <span className="text-[12px] font-normal text-plum-muted">
            {name.length} / {maxNameLength} chars
          </span>
        </label>
        <div className="relative flex items-center">
          <input
            id="gift-name"
            type="text"
            value={name}
            maxLength={maxNameLength}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Aarav &amp; Meera · 14.02.2024"
            className="w-full rounded-[14px] border border-line bg-white px-4 py-3 pr-11 font-body text-[15px] text-plum shadow-soft outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <Icon
            name="edit"
            className="pointer-events-none absolute right-4 text-[19px] text-plum-muted"
          />
        </div>
      </div>

      {/* 3. LED colour (optional) */}
      {ledColors?.length ? (
        <div className="flex flex-col gap-1.5">
          <span className="font-body text-[14px] font-bold text-plum">
            3. Select LED Base Illumination
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            {ledColors.map((color) => {
              const isActive = color.name === ledColor;
              return (
                <button
                  key={color.name}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onLedColorChange(color.name)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-2 font-body text-[13px] font-semibold transition-all",
                    isActive
                      ? "border-2 border-brand bg-section text-plum"
                      : "border border-line bg-surface text-plum hover:bg-section",
                  )}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* 4. Notes */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="gift-notes"
          className="flex items-center justify-between font-body text-[14px] font-bold text-plum"
        >
          <span>4. Custom Cropping or Layout Notes</span>
          <span className="text-[12px] font-normal text-plum-muted">Optional</span>
        </label>
        <input
          id="gift-notes"
          type="text"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="e.g. keep the whole face in frame, names at the bottom"
          className="w-full rounded-[14px] border border-line bg-white px-4 py-3 font-body text-[15px] text-plum shadow-soft outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <button
        type="button"
        onClick={onPreview}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-line bg-section py-3 font-body text-[14px] font-semibold text-brand-dark transition-colors hover:bg-line"
      >
        <Icon name="visibility" className="text-[20px]" />
        Preview Simulated Laser Carving
      </button>
    </div>
  );
}
