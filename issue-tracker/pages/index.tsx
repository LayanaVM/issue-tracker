import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login'); // or '/signup' if you prefer
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <h1 className="text-white text-4xl sm:text-6xl font-bold tracking-wider animate-pulse">
        ISSUE TRACKER
      </h1>
    </div>
  );
}
