
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRachadinha } from '@/lib/api';
import { Button } from './ui/button';
import { PlusCircle, MapPin } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import LocationSearchInput from './LocationSearchInput';

interface Place {
  name: string;
  latitude: number;
  longitude: number;
}

interface CreateRachadinhaFormProps {
    onRachadinhaCreated: (rachadinhaId: string) => void;
}

const CreateRachadinhaForm = ({ onRachadinhaCreated }: CreateRachadinhaFormProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [rachadinhaName, setRachadinhaName] = useState('');
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const createMutation = useMutation({
        mutationFn: (variables: { name: string; latitude?: number; longitude?: number }) => 
            createRachadinha({ userId: user!.id, ...variables }),
        onSuccess: (newRachadinha) => {
            queryClient.invalidateQueries({ queryKey: ['rachadinhas', user?.id] });
            setRachadinhaName('');
            setSelectedPlace(null);
            onRachadinhaCreated(newRachadinha.id);
        }
    });

    const handleCreate = () => {
        if (!rachadinhaName.trim()) return;

        if (selectedPlace && selectedPlace.name === rachadinhaName) {
            createMutation.mutate({ 
                name: selectedPlace.name,
                latitude: selectedPlace.latitude,
                longitude: selectedPlace.longitude
            });
        } else {
            createMutation.mutate({ name: rachadinhaName.trim() });
        }
    };
    
    const handleCreateWithLocation = () => {
        if (!navigator.geolocation) {
            toast({
                title: "Erro de Localização",
                description: "Geolocalização não é suportada neste navegador.",
                variant: "destructive",
            });
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const name = `Rachadinha nas Proximidades`;
                createMutation.mutate(
                    { name, latitude, longitude },
                    { onSettled: () => setIsLocating(false) }
                );
            },
            (error) => {
                toast({
                    title: "Erro de Localização",
                    description: `Não foi possível obter sua localização: ${error.message}`,
                    variant: "destructive",
                });
                setIsLocating(false);
            }
        );
    };
    
    const isCreating = createMutation.isPending || isLocating;

    return (
        <div className="flex flex-col gap-4">
            <LocationSearchInput 
                value={rachadinhaName}
                onValueChange={setRachadinhaName}
                onPlaceSelect={setSelectedPlace}
                disabled={isCreating}
            />

            <Button onClick={handleCreate} disabled={isCreating || !rachadinhaName.trim()}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                {createMutation.isPending && !isLocating ? "Criando..." : "Criar Rachadinha"}
            </Button>
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
            </div>
            
            <Button onClick={handleCreateWithLocation} variant="outline" disabled={isCreating}>
                <MapPin className="mr-2 h-4 w-4" />
                {isLocating ? "Localizando..." : "Usar minha localização atual"}
            </Button>
        </div>
    );
};

export default CreateRachadinhaForm;
