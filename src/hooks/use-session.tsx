import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export const useSession = () => {
  const [session, setSession] = useState<{ user: User | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user ? { user } : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { session, loading };
};
