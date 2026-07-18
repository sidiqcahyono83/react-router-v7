import { useEffect, useState } from "react";
import { AuthContext } from "~/context/AuthContext";
import * as AuthApi from "~/api/authLogin";
import type { User } from "~/types/typeData";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  async function refreshUser() {
    console.log("refreshUser dipanggil");

    try {
      const data = await AuthApi.me();
      console.log("refreshUser sukses:", data);
      setUser(data);
    } catch (err) {
      console.error("refreshUser gagal:", err);
      setUser(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await refreshUser();
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    console.log("USER BERUBAH:", user);
  }, [user]);

  async function logout() {
    try {
      await AuthApi.logout();
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    (async () => {
      await refreshUser();
      setInitialized(true);
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        initialized,
        isAuthenticated: !!user,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
