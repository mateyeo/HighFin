"use client";

import dynamic from "next/dynamic";

// Dynamic import with ssr:false must live inside a Client Component.
const ChatPanel = dynamic(() => import("./ChatPanel"), { ssr: false });

export default function ChatPanelLoader() {
  return <ChatPanel />;
}
