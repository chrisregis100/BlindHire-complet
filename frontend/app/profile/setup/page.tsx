"use client";

import { useRouter } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { ProfileForm } from "@/components/profile-form";
import { useWallet } from "@/contexts/wallet-context";
import { useProfile } from "@/hooks/use-profile";

export default function ProfileSetupPage() {
  const router = useRouter();
  const wallet = useWallet();
  const { profile, isLoading, hasChecked } = useProfile(
    wallet.accountAddress,
  );

  if (!wallet.accountAddress) {
    return (
      <PageContainer title="Create Profile" narrow>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to create a profile.
          </p>
        </div>
      </PageContainer>
    );
  }

  if (isLoading || !hasChecked) {
    return (
      <PageContainer title="Create Profile" narrow>
        <div className="h-64 animate-pulse rounded-xl border border-border bg-surface" />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={profile ? "Edit Profile" : "Create Profile"}
      subtitle={
        profile
          ? "Update your freelancer profile."
          : "Set up your freelancer profile so clients can learn about you."
      }
      narrow
    >
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <ProfileForm
          walletAddress={wallet.accountAddress}
          existingProfile={profile}
          onSaved={() => router.push(`/profile/${wallet.accountAddress}`)}
        />
      </div>
    </PageContainer>
  );
}
