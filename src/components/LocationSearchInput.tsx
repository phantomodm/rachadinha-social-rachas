
import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';

interface Place {
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onPlaceSelect: (place: Place | null) => void;
  disabled?: boolean;
}

const fetchApiKey = async () => {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-maps-key`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
    throw new Error(errorData.error || 'Failed to fetch API key');
  }
  const { apiKey } = await response.json();
  return apiKey;
};

const LocationSearchInput = ({ value, onValueChange, onPlaceSelect, disabled }: LocationSearchInputProps) => {
  const { data: apiKey, error: apiKeyError, isLoading: isLoadingApiKey } = useQuery({
    queryKey: ['googleMapsApiKey'],
    queryFn: fetchApiKey,
    staleTime: Infinity,
    retry: false,
  });

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries: ['places'],
    preventGoogleFontsLoading: true,
    id: 'google-map-script',
    language: 'pt-BR',
    region: 'BR',
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location && place.name) {
        onValueChange(place.name);
        onPlaceSelect({
          name: place.name,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e.target.value);
    onPlaceSelect(null);
  };
  
  if (isLoadingApiKey) {
    return <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando busca...</div>;
  }
  
  if (apiKeyError) {
    return (
        <div className="flex items-center p-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 mr-2"/>
            <span>Falha ao carregar busca. API Key do Google Maps não configurada.</span>
        </div>
    );
  }
  
  if (!isLoaded || loadError) {
    return (
        <Input
            type="text"
            placeholder="Nome da rachadinha (Ex: Jantar de sexta)"
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
        />
    );
  }

  return (
    <Autocomplete
      onLoad={handleLoad}
      onPlaceChanged={handlePlaceChanged}
      fields={['name', 'geometry.location']}
    >
      <Input
        type="text"
        placeholder="Pesquisar local ou digitar nome"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
      />
    </Autocomplete>
  );
};

export default LocationSearchInput;
