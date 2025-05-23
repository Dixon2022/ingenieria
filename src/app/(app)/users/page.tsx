
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UI_TEXT } from '@/lib/constants';
import type { ManagedUser } from '@/types';
import { Edit3, Trash2, PlusCircle, UserCog, UsersIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const initialUsers: ManagedUser[] = [
  { id: '1', identification: 'USR001', username: 'jdoe', firstName: 'John', lastName: 'Doe', isBlocked: false, roles: ['admin', 'cajero'], avatarUrl: 'https://placehold.co/40x40.png?text=JD', aiHint: 'person avatar' },
  { id: '2', identification: 'USR002', username: 'asmith', firstName: 'Alice', lastName: 'Smith', isBlocked: false, roles: ['cajero'], avatarUrl: 'https://placehold.co/40x40.png?text=AS', aiHint: 'woman avatar' },
  { id: '3', identification: 'USR003', username: 'bobb', firstName: 'Bob', lastName: 'Brown', isBlocked: true, roles: ['inventario'], avatarUrl: 'https://placehold.co/40x40.png?text=BB', aiHint: 'man avatar' },
];

const allRoles = ['admin', 'cajero', 'inventario', 'reportes'];


export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<ManagedUser>>({});
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const { toast } = useToast();

  const handleOpenModal = (user?: ManagedUser) => {
    setEditingUser(user || null);
    setCurrentUser(user ? { ...user } : { identification: '', username: '', firstName: '', lastName: '', isBlocked: false, roles: [] });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser({});
    setEditingUser(null);
  };

  const handleSaveUser = () => {
    if (!currentUser.identification || !currentUser.username || !currentUser.firstName || !currentUser.lastName) {
      toast({ variant: 'destructive', title: 'Error', description: 'Identificación, usuario, nombre y apellido son requeridos.' });
      return;
    }

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...currentUser } as ManagedUser : u));
      toast({ title: 'Usuario Actualizado', description: `El usuario "${currentUser.username}" ha sido actualizado.` });
    } else {
      const newUser: ManagedUser = {
        id: (Math.random() * 10000).toString(), // simple ID generation
        identification: currentUser.identification!,
        username: currentUser.username!,
        firstName: currentUser.firstName!,
        lastName: currentUser.lastName!,
        isBlocked: currentUser.isBlocked || false,
        roles: currentUser.roles || [],
        avatarUrl: `https://placehold.co/40x40.png?text=${currentUser.firstName!.charAt(0)}${currentUser.lastName!.charAt(0)}`,
        aiHint: 'person avatar'
      };
      setUsers([...users, newUser]);
      toast({ title: 'Usuario Agregado', description: `El usuario "${newUser.username}" ha sido agregado.` });
    }
    handleCloseModal();
  };

  const handleDeleteUser = (userId: string) => {
    const userName = users.find(u => u.id === userId)?.username;
    setUsers(users.filter(u => u.id !== userId));
    toast({ title: 'Usuario Eliminado', description: `El usuario "${userName}" ha sido eliminado.`, variant: 'destructive' });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCurrentUser(prev => prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : null);
  };

  const handleRoleChange = (role: string) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const currentRoles = prev.roles || [];
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role];
      return { ...prev, roles: newRoles };
    });
  };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <UsersIcon className="mr-2 h-6 w-6" />
          {UI_TEXT.USERS_TITLE}
        </CardTitle>
        <CardDescription>{UI_TEXT.MANAGE_USERS_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => handleOpenModal()} variant="default">
            <PlusCircle className="mr-2 h-4 w-4" />
            {UI_TEXT.ADD_USER}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] hidden sm:table-cell">Usuario</TableHead>
                <TableHead>{UI_TEXT.IDENTIFICATION}</TableHead>
                <TableHead>{UI_TEXT.FIRST_NAME}</TableHead>
                <TableHead>{UI_TEXT.LAST_NAME}</TableHead>
                <TableHead>{UI_TEXT.ROLES}</TableHead>
                <TableHead>{UI_TEXT.STATUS}</TableHead>
                <TableHead className="text-center">{UI_TEXT.ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="hidden sm:table-cell">
                     <div className="flex items-center gap-2">
                        <Image src={user.avatarUrl || `https://placehold.co/40x40.png?text=${user.firstName.charAt(0)}`} alt={user.username} width={40} height={40} className="rounded-full object-cover" data-ai-hint={user.aiHint || 'person avatar'} />
                        <span className="font-medium">{user.username}</span>
                     </div>
                  </TableCell>
                  <TableCell>{user.identification}</TableCell>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => <Badge key={role} variant="secondary">{role}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isBlocked ? 'destructive' : 'default'}>
                      {user.isBlocked ? UI_TEXT.USER_STATE_BLOCKED : UI_TEXT.USER_STATE_ACTIVE}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(user)} className="text-primary hover:text-primary/80">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {users.length === 0 && (
          <p className="text-center text-muted-foreground py-10">{UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? UI_TEXT.EDIT_USER : UI_TEXT.ADD_USER}</DialogTitle>
            <DialogDescription>
              {editingUser ? `Actualice los detalles del usuario "${editingUser.username}".` : "Ingrese los detalles del nuevo usuario."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="identification" className="text-right">{UI_TEXT.IDENTIFICATION}</Label>
              <Input id="identification" name="identification" value={currentUser?.identification || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">{UI_TEXT.USERNAME}</Label>
              <Input id="username" name="username" value={currentUser?.username || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">{UI_TEXT.FIRST_NAME}</Label>
              <Input id="firstName" name="firstName" value={currentUser?.firstName || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">{UI_TEXT.LAST_NAME}</Label>
              <Input id="lastName" name="lastName" value={currentUser?.lastName || ''} onChange={handleChange} className="col-span-3" />
            </div>
             {/* Password field could be added here, typically handled separately for security */}
            <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="isBlocked" className="text-right">{UI_TEXT.STATUS}</Label>
               <Checkbox
                id="isBlocked"
                name="isBlocked"
                checked={currentUser?.isBlocked || false}
                onCheckedChange={(checked) => setCurrentUser(prev => prev ? { ...prev, isBlocked: !!checked } : null)}
                className="col-span-3 justify-self-start"
              />
            </div>
             <div className="col-span-4">
              <Label className="text-sm font-medium">{UI_TEXT.ASSIGN_ROLES}</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-md border p-3">
                {allRoles.map(role => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={currentUser?.roles?.includes(role) || false}
                      onCheckedChange={() => handleRoleChange(role)}
                    />
                    <label
                      htmlFor={`role-${role}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {role}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>{UI_TEXT.CANCEL}</Button>
            <Button type="submit" onClick={handleSaveUser}>{UI_TEXT.SAVE_CHANGES}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
