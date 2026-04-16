"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCompare } from "@/contexts/compare-context";

export default function LoadSavedPage() {
  const params = useParams();
  const router = useRouter();
  const { saved, loadSaved } = useCompare();

  useEffect(() => {
    const id = params.id as string | undefined;
    if (!id) {
      router.replace("/compare");
      return;
    }
    const exists = saved.find((c) => c.id === id);
    if (exists) {
      loadSaved(id);
    }
    router.replace("/compare");
  }, [params.id, saved, loadSaved, router]);

  return <div className="mx-auto h-dvh max-w-[430px] bg-background" />;
}
