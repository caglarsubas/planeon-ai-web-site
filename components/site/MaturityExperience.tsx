'use client';
import { MaturityAtlas } from './MaturityAtlas';
import { MaturityLevels } from './MaturityLevels';
import { useUrlState } from '@/lib/url-state';

export type MaturitySelection = Pick<
  ReturnType<typeof useUrlState>,
  'params' | 'update'
>;

export function MaturityExperience() {
  // One history owner keeps level, evidence and reverse lookup synchronized.
  const { params, update } = useUrlState();
  return (
    <>
      <MaturityLevels params={params} update={update} />
      <MaturityAtlas params={params} update={update} />
    </>
  );
}
