"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FinanceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/finance/report");
  }, [router]);
  return null;
}
