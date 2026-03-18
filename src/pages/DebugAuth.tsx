import React from 'react';
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function DebugAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me);

  const decodeJWT = (token: string | null) => {
    if (!token) return { header: null, payload: null };
    try {
      const parts = token.split('.');
      const decode = (str: string) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')));
      };
      return { 
        header: decode(parts[0]),
        payload: decode(parts[1])
      };
    } catch (e) {
      return { error: "Failed to decode", message: (e as any).message };
    }
  };

  const token = typeof window !== 'undefined' ? window.localStorage.getItem("__convexAuthJWT_httpsfinesheep503convexcloud") : null;
  const { header, payload } = decodeJWT(token) as any;

  return (
    <div className="p-8 font-mono bg-gray-900 text-green-400 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 border-b border-green-800 pb-2">🔐 Auth Diagnostic</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl text-white mb-2 underline">Token Header</h2>
          <pre className="bg-black p-4 rounded overflow-auto border border-purple-900 text-purple-300 text-xs">
            {JSON.stringify(header, null, 2) || "NO TOKEN"}
          </pre>
        </section>

        <section>
          <h2 className="text-xl text-white mb-2 underline">Token Payload</h2>
          <pre className="bg-black p-4 rounded overflow-auto border border-blue-900 text-blue-300 text-xs">
            {JSON.stringify(payload, null, 2) || "NO TOKEN"}
          </pre>
        </section>

        <section>
          <h2 className="text-xl text-white mb-2 underline">Frontend State (useConvexAuth)</h2>
          <p>⏳ Loading: <span className={isLoading ? "text-yellow-400" : "text-blue-400"}>{isLoading ? "YES" : "NO"}</span></p>
          <p>✅ Authenticated: <span className={isAuthenticated ? "text-green-400" : "text-red-400"}>{isAuthenticated ? "YES" : "NO"}</span></p>
        </section>

        <section>
          <h2 className="text-xl text-white mb-2 underline">Browser Storage</h2>
          <p>📦 convex-auth-token: <span className="text-pink-400">
            {typeof window !== 'undefined' ? (window.localStorage.getItem("convex-auth-token") ? "PRESENT (hidden for security)" : "MISSING") : "N/A"}
          </span></p>
          <p>🧪 All storage keys: {typeof window !== 'undefined' ? Object.keys(window.localStorage).join(", ") : "N/A"}</p>
        </section>

        <section>
          <h2 className="text-xl text-white mb-2 underline">Backend Data (api.users.me)</h2>
          <pre className="bg-black p-4 rounded overflow-auto border border-green-900">
            {JSON.stringify(me, null, 2) || (me === null ? "null (User not found in DB)" : "undefined (Loading...)")}
          </pre>
        </section>

        <section>
          <h2 className="text-xl text-white mb-2 underline">Environment</h2>
          <p>URL: {window.location.href}</p>
          <p>Origin: {window.location.origin}</p>
          <p>Convex URL: {import.meta.env.VITE_CONVEX_URL}</p>
        </section>

        <button 
          onClick={() => window.location.href = "/login"}
          className="mt-8 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
