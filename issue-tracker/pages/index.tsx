import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, []);

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-purple-800 text-white text-5xl font-alumni tracking-wide transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      ISSUE TRACKER
    </div>
  );
}
