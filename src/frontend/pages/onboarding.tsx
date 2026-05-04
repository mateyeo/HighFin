"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy route — redirect to the new register page.
export default function OnboardingPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/register"); }, [router]);
  return null;
}
