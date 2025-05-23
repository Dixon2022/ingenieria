
"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { APP_NAME, UI_TEXT } from '@/lib/constants';
import { Loader2, Utensils, Building } from 'lucide-react'; // Utensils as a bakery icon, Building for branch

// Mock branches for the select input
const mockBranches = [
  { id: 'branch1', name: 'Sucursal Centro' },
  { id: 'branch2', name: 'Sucursal Norte' },
  { id: 'branch3', name: 'Sucursal Sur' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For now, branch selection is not passed to login function
    // This can be integrated later if needed: await login(username, password, branch);
    await login(username, password);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Utensils size={32} />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">{APP_NAME}</CardTitle>
          <CardDescription className="text-muted-foreground">Sistema de Gestión</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">{UI_TEXT.USERNAME_LABEL}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="amores"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{UI_TEXT.PASSWORD_LABEL}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">{UI_TEXT.BRANCH_LABEL}</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger id="branch" className="w-full">
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={`Seleccione ${UI_TEXT.BRANCH_LABEL.toLowerCase()}`} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {mockBranches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {UI_TEXT.LOGIN_BUTTON}
            </Button>
          </form>
        </CardContent>
      </Card>
       <p className="mt-8 text-center text-sm text-muted-foreground">
        Usuario de demostración: <strong>amores</strong> / Contraseña: <strong>pan</strong>
      </p>
    </div>
  );
}
