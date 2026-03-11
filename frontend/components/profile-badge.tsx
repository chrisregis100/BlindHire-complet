import Link from "next/link";

import { truncateAddress } from "@/lib/format";
import { Profile } from "@/lib/types";

interface ProfileBadgeProps {
  profile: Profile | null;
  walletAddress: string;
  showRating?: boolean;
  size?: "sm" | "md";
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3.5 w-3.5 text-yellow-400"
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

export function ProfileBadge({
  profile,
  walletAddress,
  showRating = true,
  size = "md",
}: ProfileBadgeProps) {
  if (!profile) {
    return (
      <Link
        href={`/profile/${walletAddress}`}
        className="flex items-center gap-3 rounded-lg p-1 -ml-1 transition-colors hover:bg-surface-hover"
        aria-label="View profile"
        tabIndex={0}
      >
        <div
          className={`shrink-0 rounded-full bg-surface-hover ${size === "sm" ? "h-8 w-8" : "h-10 w-10"}`}
        />
        <p className="truncate font-mono text-xs text-muted-foreground">
          {truncateAddress(walletAddress)}
        </p>
      </Link>
    );
  }

  const avatarSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const nameSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <Link
      href={`/profile/${walletAddress}`}
      className="flex items-center gap-3 rounded-lg transition-colors hover:bg-surface-hover p-1 -ml-1"
      aria-label={`View profile of ${profile.name}`}
      tabIndex={0}
    >
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.name}
          className={`${avatarSize} shrink-0 rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${avatarSize} flex shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary`}
        >
          {profile.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <p className={`${nameSize} font-semibold text-foreground truncate`}>
          {profile.name}
        </p>
        <div className="flex items-center gap-2">
          {profile.title && (
            <p className="truncate text-xs text-muted-foreground">{profile.title}</p>
          )}
          {showRating && profile.rating > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <StarIcon />
              {profile.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
