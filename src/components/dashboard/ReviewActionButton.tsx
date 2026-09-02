"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ReviewActionButton({ inspectionId }: { inspectionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReview() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/inspections/${inspectionId}/review`, { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? "Gagal menandai review.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-right">
      <Button size="sm" onClick={handleReview} disabled={loading}>
        {loading ? "Memproses..." : "Tandai Sudah Direview"}
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
