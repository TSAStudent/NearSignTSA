import type { UserProfile, DiscoverProfile } from '@/types';

/**
 * Computes match score (0–100) between current user and another profile using
 * interests, communication preferences, distance, and would-you-rather answers.
 */
export function computeMatchScore(
  currentUser: UserProfile | null,
  profile: UserProfile & { distance?: number },
  distance: number
): number {
  if (!currentUser) return 50;

  let score = 50;

  // Shared interests (up to ~15 points)
  const sharedInterests = currentUser.interests.filter((i) => profile.interests.includes(i));
  if (currentUser.interests.length > 0) {
    const interestRatio = sharedInterests.length / Math.max(currentUser.interests.length, profile.interests.length);
    score += interestRatio * 15;
  }

  // Shared communication preferences (up to ~15 points)
  const sharedComm = currentUser.communicationPreferences.filter((c) =>
    profile.communicationPreferences.includes(c)
  );
  if (currentUser.communicationPreferences.length > 0) {
    const commRatio = sharedComm.length / Math.max(currentUser.communicationPreferences.length, profile.communicationPreferences.length);
    score += commRatio * 15;
  }

  // Distance: closer = better (up to 10 points, subtract for far)
  if (distance <= 5) score += 10;
  else if (distance <= 10) score += 6;
  else if (distance <= 20) score += 2;
  else if (distance > 35) score -= 5;

  // Would-you-rather alignment (up to 10 points)
  const myWyr = currentUser.wouldYouRatherAnswers ?? {};
  const theirWyr = profile.wouldYouRatherAnswers ?? {};
  const wyrIds = Object.keys(myWyr).filter((id) => theirWyr[id] !== undefined);
  if (wyrIds.length > 0) {
    const matching = wyrIds.filter((id) => myWyr[id] === theirWyr[id]).length;
    score += (matching / wyrIds.length) * 10;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Takes profiles (with distance) and current user, returns DiscoverProfile[] with recomputed matchScore.
 */
export function withComputedMatchScores(
  currentUser: UserProfile | null,
  profiles: DiscoverProfile[]
): DiscoverProfile[] {
  return profiles.map((p) => ({
    ...p,
    matchScore: computeMatchScore(currentUser, p, p.distance),
  }));
}
