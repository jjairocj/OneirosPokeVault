import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface UserProfile {
  userId: number;
  displayName: string | null;
  bannerImage: string | null;
  featuredCards: string | null;
  updatedAt?: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/pro/profile');
      if (res.ok) setProfile(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (updates: {
    displayName?: string;
    bannerImage?: string;
    featuredCards?: string[];
  }): Promise<boolean> => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/pro/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) { setProfile(await res.json()); return true; }
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const featuredCardIds: string[] = (() => {
    try { return profile?.featuredCards ? JSON.parse(profile.featuredCards) : []; }
    catch { return []; }
  })();

  return { profile, loading, saving, fetchProfile, saveProfile, featuredCardIds };
}
