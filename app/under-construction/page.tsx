import type { Metadata } from "next";
import { UnderConstructionGate } from "@/components/UnderConstructionGate";

export const metadata: Metadata = {
  title: "Reachlyst is under construction",
  robots: {
    index: false,
    follow: false
  }
};

export default async function UnderConstructionPage({ searchParams }: { searchParams?: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const nextPath = params?.next?.startsWith("/") ? params.next : "/";
  return <UnderConstructionGate nextPath={nextPath} />;
}
