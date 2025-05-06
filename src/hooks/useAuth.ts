import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
}

interface UserWithProfile extends User {
  profile?: Profile;
}

export function useAuth() {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("プロフィール取得エラー:", error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error("プロフィール取得中にエラーが発生:", error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            setUser({ ...session.user, profile });
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser({ ...session.user, profile });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error("ログアウトエラー:", error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signOut,
  };
}
