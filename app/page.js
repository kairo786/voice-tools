// app/page.tsx
"use client"
import JarvisChat from "./components/jarvischat";
import Link from "next/link";

export default function Home() {
  //  let a = window.confirm("hi");
  return (
    <main>
     
      <h1 className="text-xl font-bold text-center my-4">Jarvis Chat</h1>
      <JarvisChat />
          </main>
  );
}