import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export type AdminState =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "notAdmin"; user: User }
  | { status: "admin"; user: User };

export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({ status: "loading" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ status: "signedOut" });
        return;
      }
      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) setState({ status: "admin", user });
      else setState({ status: "notAdmin", user });
    });

    return () => unsub();
  }, []);

  return state;
}
