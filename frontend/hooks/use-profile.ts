"use client";

import { useCallback, useEffect, useState } from "react";

import { getProfile, getProfilesByWallets } from "@/lib/profiles";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Profile } from "@/lib/types";

export function useProfile(walletAddress: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!walletAddress || !isSupabaseConfigured) {
      setProfile(null);
      setHasChecked(true);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getProfile(walletAddress);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
      setHasChecked(true);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, hasChecked, refetch: fetchProfile, setProfile };
}

export function useProfilesByWallets(walletAddresses: string[]) {
  const [profileMap, setProfileMap] = useState<Map<string, Profile>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);

  const key = walletAddresses
    .map((a) => a.toLowerCase())
    .sort()
    .join(",");

  useEffect(() => {
    if (!walletAddresses.length || !isSupabaseConfigured) {
      setProfileMap(new Map());
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getProfilesByWallets(walletAddresses)
      .then((map) => {
        if (!cancelled) setProfileMap(map);
      })
      .catch(() => {
        if (!cancelled) setProfileMap(new Map());
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { profileMap, isLoading };
}
