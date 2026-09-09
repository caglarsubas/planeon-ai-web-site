export async function studioFetch<T>(
  path: string,
  body?: unknown,
  method = body === undefined ? 'GET' : 'POST',
): Promise<T> {
  const response = await fetch(`/api/studio${path}`, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = (await response.json()) as T & {
    message?: string;
    code?: string;
  };
  if (!response.ok)
    throw new Error(
      data.message ||
        (
          {
            SIGN_IN_REQUIRED: 'Verify your company email to continue.',
            STALE_REVIEW:
              'This review is stale. Refresh and inspect the current version.',
            NOT_FOUND:
              'This request or document is unavailable to this account.',
            RATE_LIMITED: 'Please wait before trying again.',
            INVALID_INPUT: 'Check the required information.',
            STUDIO_OFFLINE:
              'The local service is offline. Reference examples are still available.',
          } as Record<string, string>
        )[data.code || ''] ||
        'This operation is unavailable. Please try again later.',
    );
  return data;
}
export type StudioSession = {
  user: { email: string; reviewer: boolean } | null;
};
export type PublicRequest = {
  id: string;
  title: string;
  status: string;
  submitted: number;
  expires: number;
  version: number | null;
  manifest?: {
    version: number;
    snapshotHash: string;
    artifacts: { name: string; bytes: number; sha256: string }[];
  };
  delivery: { state: string; mode: string } | null;
};
