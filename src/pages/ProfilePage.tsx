
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, uploadAvatar, updateUserProfile } from '@/lib/api/users';
import { Skeleton } from '@/components/ui/skeleton';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getUserProfile(user!.id),
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(user!.id, file),
    onSuccess: (avatarUrl) => {
      updateProfileMutation.mutate({ avatar_url: avatarUrl });
    },
    onError: (error) => {
      toast({ title: 'Erro no Upload', description: error.message, variant: 'destructive' });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: { avatar_url: string }) => updateUserProfile(user!.id, updates),
    onSuccess: () => {
      toast({ title: 'Perfil atualizado!', description: 'Sua foto de perfil foi atualizada.' });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['auth'] }); // To refetch user data in header
      setAvatarFile(null);
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar perfil', description: error.message, variant: 'destructive' });
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpload = () => {
    if (avatarFile) {
      uploadMutation.mutate(avatarFile);
    }
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const names = name.split(' ');
      const initials = names.map(n => n[0]).join('');
      return initials.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return '';
  };
  
  if (!user) return <div className="container mx-auto py-8">Você precisa estar logado para ver esta página.</div>

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>Veja e edite suas informações de perfil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          ) : profile ? (
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                <AvatarFallback>{getInitials(profile.full_name, user.email)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          ) : (
             <div>Perfil não encontrado.</div>
          )}

          <div className="space-y-2">
            <label htmlFor="avatar" className="font-medium">Alterar foto de perfil</label>
            <div className="flex items-center gap-4">
              <Input id="avatar" type="file" onChange={handleAvatarChange} accept="image/*" className="flex-grow" disabled={uploadMutation.isPending || updateProfileMutation.isPending}/>
              <Button onClick={handleAvatarUpload} disabled={!avatarFile || uploadMutation.isPending || updateProfileMutation.isPending}>
                {uploadMutation.isPending || updateProfileMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
            {avatarFile && <p className="text-sm text-muted-foreground">Arquivo selecionado: {avatarFile.name}</p>}
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
