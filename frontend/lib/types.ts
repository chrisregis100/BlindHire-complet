export interface JobView {
  jobId: number;
  clientAddress: string;
  jobDescription: string;
  commitDeadline: number;
  revealDeadline: number;
  finalized: boolean;
}

export interface RevealedBidView {
  freelancerAddress: string;
  amount: bigint;
}

export interface WinnerView {
  hasWinner: boolean;
  winnerAddress: string;
  winningAmount: bigint;
}

export interface Profile {
  wallet_address: string;
  name: string;
  title: string;
  bio: string;
  country: string;
  avatar_url: string;
  skills: string[];
  rating: number;
  created_at: string;
}

export interface ProfileFormData {
  name: string;
  title: string;
  bio: string;
  country: string;
  skills: string[];
  avatar_url: string;
}
