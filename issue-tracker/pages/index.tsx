import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login"); // make sure you have /login page
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <h1 className="text-white text-4xl font-bold tracking-widest">
        ISSUE TRACKER
      </h1>
    </div>
  );
}
