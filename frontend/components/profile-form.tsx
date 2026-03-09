"use client";

import { FormEvent, useRef, useState } from "react";

import { FormInput, FormTextarea } from "@/components/form-input";
import { PrimaryButton } from "@/components/primary-button";
import { createProfile, updateProfile, uploadAvatar } from "@/lib/profiles";
import { Profile, ProfileFormData } from "@/lib/types";

interface ProfileFormProps {
  walletAddress: string;
  existingProfile?: Profile | null;
  onSaved: (profile: Profile) => void;
}

const COUNTRIES = [
  "Algeria", "Argentina", "Australia", "Brazil", "Canada", "China",
  "Colombia", "Egypt", "Ethiopia", "France", "Germany", "Ghana", "India",
  "Indonesia", "Italy", "Japan", "Kenya", "Mexico", "Morocco", "Netherlands",
  "Nigeria", "Pakistan", "Philippines", "Poland", "Rwanda", "Saudi Arabia",
  "Senegal", "South Africa", "South Korea", "Spain", "Tanzania", "Tunisia",
  "Turkey", "UAE", "Uganda", "UK", "USA", "Vietnam",
];

export function ProfileForm({
  walletAddress,
  existingProfile,
  onSaved,
}: ProfileFormProps) {
  const isEdit = !!existingProfile;

  const [name, setName] = useState(existingProfile?.name ?? "");
  const [title, setTitle] = useState(existingProfile?.title ?? "");
  const [bio, setBio] = useState(existingProfile?.bio ?? "");
  const [country, setCountry] = useState(existingProfile?.country ?? "");
  const [skillsInput, setSkillsInput] = useState(
    existingProfile?.skills?.join(", ") ?? "",
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(
    existingProfile?.avatar_url ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      let avatarUrl = existingProfile?.avatar_url ?? "";

      if (avatarFile) {
        avatarUrl = await uploadAvatar(walletAddress, avatarFile);
      }

      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const formData: ProfileFormData = {
        name,
        title,
        bio,
        country,
        skills,
        avatar_url: avatarUrl,
      };

      const saved = isEdit
        ? await updateProfile(walletAddress, formData)
        : await createProfile(walletAddress, formData);

      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar upload */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full self-start sm:self-auto"
          aria-label="Upload avatar"
          tabIndex={0}
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-hover text-muted-foreground hover:bg-border transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                />
              </svg>
            </div>
          )}
        </button>
        <div>
          <p className="text-sm font-medium text-foreground">Profile Photo</p>
          <p className="text-xs text-muted-foreground">
            Click to upload (JPG, PNG, WebP)
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
          className="hidden"
          aria-label="Avatar file upload"
        />
      </div>

      <FormInput
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Sarah Johnson"
      />

      <FormInput
        label="Professional Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Frontend Developer"
      />

      <div className="space-y-1">
        <label
          htmlFor="country-select"
          className="block text-sm font-medium text-foreground"
        >
          Country
        </label>
        <select
          id="country-select"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <option value="">Select country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <FormInput
        label="Skills"
        hint="Comma-separated (e.g. React, Next.js, UI Design)"
        value={skillsInput}
        onChange={(e) => setSkillsInput(e.target.value)}
        placeholder="React, TypeScript, Solidity"
      />

      <FormTextarea
        label="Short Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={3}
        placeholder="Tell clients about your experience and expertise."
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3" role="alert">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <div className="pt-2">
        <PrimaryButton type="submit" disabled={isSaving} fullWidth>
          {isSaving
            ? "Saving…"
            : isEdit
              ? "Update Profile"
              : "Create Profile"}
        </PrimaryButton>
      </div>
    </form>
  );
}
