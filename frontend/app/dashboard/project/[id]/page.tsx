"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditorPage() {
  const router = useRouter();
  const params = useParams<{
    id: any;
    tag: string;
    item: string;
  }>();
  useEffect(() => {
    const redirect = params.id + "/form";
    router.push(redirect);
  });
}
