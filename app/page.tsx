"use client";

import Preloader from "@/components/preloader";

export default function Home() {
  return (
    <>
      <Preloader />
      <main className="bg-[#f3f9d2] w-screen h-svh flex flex-col gap-2 items-center justify-center text-center">
        <h1>Una visión</h1>
        <h1>Capturada a través de</h1>
        <h1>Animar</h1>
      </main>
    </>
  );
}
