"use client";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { useState } from "react";

export function AuthDebugInfo() {
  const { user, status, session } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-neutral-900 text-white px-3 py-2 text-xs rounded opacity-50 hover:opacity-100"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-green-400 p-4 rounded font-mono text-xs max-w-sm max-h-96 overflow-auto z-50">
      <button
        onClick={() => setShowDebug(false)}
        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
      >
        ✕
      </button>

      <div className="space-y-2">
        <div>
          <span className="text-blue-400">Status:</span> {status}
        </div>
        <div>
          <span className="text-blue-400">User ID:</span> {user?.id || "null"}
        </div>
        <div>
          <span className="text-blue-400">User Name:</span> {user?.name || "null"}
        </div>
        <div>
          <span className="text-blue-400">User Email:</span> {user?.email || "null"}
        </div>
        <div>
          <span className="text-blue-400">Has Token:</span> {session?.token ? "✓" : "✗"}
        </div>
        <div>
          <span className="text-blue-400">Session Expires:</span>
          {session?.expiresAt
            ? new Date(session.expiresAt).toLocaleString()
            : "null"}
        </div>
        <div>
          <span className="text-yellow-400 mt-4 block">Raw User:</span>
          <pre className="text-xs mt-1">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
