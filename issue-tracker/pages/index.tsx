import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500); // start fade after 1.5s

    const redirectTimer = setTimeout(() => {
      router.push("/login"); // or /auth
    }, 2000); // redirect after 2s

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, []);

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-black text-white text-4xl font-bold transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      ISSUE TRACKER
    </div>
  );
}
