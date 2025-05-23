
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace(ROUTES.POS);
      } else {
        router.replace(ROUTES.LOGIN);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg">Cargando {APP_NAME}...</p>
    </div>
  );
}
