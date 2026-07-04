/**
 * The ONLY fields of another user that may ever be sent to a client.
 * Never select User.email or User.passwordHash in any public query.
 */
export const publicProfileSelect = {
  userId: true,
  username: true,
  avatarUrl: true,
  bio: true,
  language: true,
  positiveCount: true,
  negativeCount: true,
} as const;

export type PublicProfile = {
  userId: string;
  username: string;
  avatarUrl: string;
  bio: string;
  language: string;
  positiveCount: number;
  negativeCount: number;
};
