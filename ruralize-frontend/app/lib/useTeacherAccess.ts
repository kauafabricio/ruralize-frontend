"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { getProfileByUser, type ProfileResponse } from "@/app/services/api/profile.api";
import { isTeacherRole, isTeacherUser } from "./userEvents";

export function useTeacherAccess() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    let active = true;

    if (!user?.id) {
      setProfile(null);
      return;
    }

    setLoadingProfile(true);
    getProfileByUser(user.id)
      .then((nextProfile) => {
        if (active) {
          setProfile(nextProfile);
        }
      })
      .catch(() => {
        if (active) {
          setProfile(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingProfile(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  return {
    user,
    profile,
    loadingProfile,
    isTeacher: isTeacherUser(user) || isTeacherRole(profile?.role),
  };
}
