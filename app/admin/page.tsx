"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import AdminPanel from "../../components/AdminPanel";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        if (userData?.username === "admin") {
          setIsAdmin(true);
        } else {
          window.location.href = "/";
        }
      } else {
        window.location.href = "/";
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? <AdminPanel /> : null;
}
