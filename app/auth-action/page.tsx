"use client";

import AuthActionContent from "@/components/AuthActionContent";
import { Suspense } from "react";

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-center">Зареждане...</p>
        </div>
      }
    >
      <AuthActionContent />
    </Suspense>
  );
}
