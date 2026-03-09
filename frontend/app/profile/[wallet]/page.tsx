"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { PrimaryButton } from "@/components/primary-button";
import { useWallet } from "@/contexts/wallet-context";
import { useProfile } from "@/hooks/use-profile";
import { truncateAddress } from "@/lib/format";

function StarIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 text-yellow-400"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function ProfilePage() {
  const { wallet: walletParam } = useParams<{ wallet: string }>();
  const { profile, isLoading } = useProfile(walletParam);
  const currentWallet = useWallet();

  const isOwner =
    currentWallet.accountAddress?.toLowerCase() === walletParam?.toLowerCase();

  if (isLoading) {
    return (
      <PageContainer title="Freelancer Profile" narrow>
        <div className="h-80 animate-pulse rounded-xl border border-border bg-surface" />
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer title="Freelancer Profile" narrow>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20">
          <p className="mb-1 text-base font-semibold text-foreground">
            Profile not found
          </p>
          <p className="text-sm text-muted-foreground">
            {truncateAddress(walletParam ?? "")}
          </p>
          {isOwner && (
            <div className="mt-6">
              <PrimaryButton as={Link} href="/profile/setup">
                Create Profile
              </PrimaryButton>
            </div>
          )}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Freelancer Profile"
      action={
        isOwner ? (
          <PrimaryButton as={Link} href="/profile/setup" variant="secondary">
            Edit Profile
          </PrimaryButton>
        ) : null
      }
      narrow
    >
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
            {profile.title && (
              <p className="mt-0.5 text-base text-muted-foreground">
                {profile.title}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {profile.country && (
                <span className="text-sm text-muted-foreground">
                  {profile.country}
                </span>
              )}
              {profile.rating > 0 && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <StarIcon />
                  {profile.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Wallet */}
        <div className="mt-6 rounded-lg bg-background px-4 py-3 border border-border">
          <p className="mb-1 text-xs text-muted-foreground">Wallet Address</p>
          <p className="break-all font-mono text-xs text-foreground">
            {walletParam}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
