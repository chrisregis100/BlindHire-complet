import { getSupabase } from "@/lib/supabase";
import { Profile, ProfileFormData } from "@/lib/types";

export async function getProfile(
  walletAddress: string,
): Promise<Profile | null> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data as Profile | null;
}

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch profiles: ${error.message}`);
  return (data ?? []) as Profile[];
}

export async function getProfilesByWallets(
  walletAddresses: string[],
): Promise<Map<string, Profile>> {
  if (!walletAddresses.length) return new Map();

  const normalized = walletAddresses.map((a) => a.toLowerCase());
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .in("wallet_address", normalized);

  if (error) throw new Error(`Failed to fetch profiles: ${error.message}`);

  const map = new Map<string, Profile>();
  for (const profile of data ?? []) {
    map.set(profile.wallet_address, profile as Profile);
  }
  return map;
}

export async function createProfile(
  walletAddress: string,
  formData: ProfileFormData,
): Promise<Profile> {
  const row = {
    wallet_address: walletAddress.toLowerCase(),
    name: formData.name,
    title: formData.title,
    bio: formData.bio,
    country: formData.country,
    skills: formData.skills,
    avatar_url: formData.avatar_url,
    rating: 0,
  };

  const { data, error } = await getSupabase()
    .from("profiles")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`Failed to create profile: ${error.message}`);
  return data as Profile;
}

export async function updateProfile(
  walletAddress: string,
  formData: Partial<ProfileFormData>,
): Promise<Profile> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .update(formData)
    .eq("wallet_address", walletAddress.toLowerCase())
    .select()
    .single();

  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return data as Profile;
}

export async function uploadAvatar(
  walletAddress: string,
  file: File,
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const filePath = `${walletAddress.toLowerCase()}.${fileExt}`;

  const client = getSupabase();
  const { error: uploadError } = await client.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError)
    throw new Error(`Failed to upload avatar: ${uploadError.message}`);

  const {
    data: { publicUrl },
  } = client.storage.from("avatars").getPublicUrl(filePath);

  return publicUrl;
}
