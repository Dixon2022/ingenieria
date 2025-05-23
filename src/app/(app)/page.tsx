"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function AppRootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(ROUTES.POS);
  }, [router]);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg">Redirigiendo...</p>
    </div>
  );
}
