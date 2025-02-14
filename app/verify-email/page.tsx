"use client";

import VerifyEmailContent from "@/components/VerifyEmailContent";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 to-white">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500 mb-4"></div>
            <p className="text-center text-gray-800 font-medium">
              Зареждане...
            </p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
