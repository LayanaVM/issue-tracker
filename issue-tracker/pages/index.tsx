import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export default function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/dashboard");
      } else {
        setTimeout(() => setFadeOut(true), 1500);
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    checkSessionAndRedirect();
  }, []);

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-[#1a0026] text-[#ff4fe4] text-4xl font-extrabold tracking-wide transition-opacity duration-500 font-alumni ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      ISSUE TRACKER
    </div>
  );
}
