
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRachadinhaData, getAppSettings } from '@/lib/api';

export const useRachadinhaData = (rachadinhaId: string) => {
  const { data: fetchedRachadinhaData, isLoading: isLoadingRachadinha } = useQuery({
    queryKey: ['rachadinha', rachadinhaId],
    queryFn: () => getRachadinhaData(rachadinhaId),
    enabled: !!rachadinhaId,
  });

  const rachadinhaData = useMemo(() => {
    if (!fetchedRachadinhaData) return undefined;

    if (fetchedRachadinhaData.participants.length === 0 && fetchedRachadinhaData.items.length === 0) {
        const dummyParticipants = [
            { id: 'dummy-p1', name: 'João Silva', rachadinha_id: rachadinhaId },
            { id: 'dummy-p2', name: 'Maria Souza', rachadinha_id: rachadinhaId },
            { id: 'dummy-p3', name: 'Pedro Costa', rachadinha_id: rachadinhaId },
            { id: 'dummy-p4', name: 'Ana Pereira', rachadinha_id: rachadinhaId },
        ];
    
        const dummyItems = [
            { 
                id: 'dummy-i1', 
                name: 'Pizza de Calabresa', 
                price: 45.50, 
                rachadinha_id: rachadinhaId,
                item_participants: [
                    { participant_id: 'dummy-p1', item_id: 'dummy-i1' }, 
                    { participant_id: 'dummy-p2', item_id: 'dummy-i1' },
                ] 
            },
            { 
                id: 'dummy-i2', 
                name: 'Refrigerante 2L', 
                price: 12.00, 
                rachadinha_id: rachadinhaId,
                item_participants: [
                    { participant_id: 'dummy-p1', item_id: 'dummy-i2' }, 
                    { participant_id: 'dummy-p2', item_id: 'dummy-i2' },
                    { participant_id: 'dummy-p3', item_id: 'dummy-i2' },
                ] 
            },
            {
                id: 'dummy-i3',
                name: 'Porção de Fritas',
                price: 25.00,
                rachadinha_id: rachadinhaId,
                item_participants: [
                    { participant_id: 'dummy-p3', item_id: 'dummy-i3' },
                    { participant_id: 'dummy-p4', item_id: 'dummy-i3' },
                ]
            },
            {
                id: 'dummy-i4',
                name: 'Suco de Laranja',
                price: 8.00,
                rachadinha_id: rachadinhaId,
                item_participants: [
                    { participant_id: 'dummy-p4', item_id: 'dummy-i4' },
                ]
            }
        ];

        return {
            ...fetchedRachadinhaData,
            participants: dummyParticipants,
            items: dummyItems,
        };
    }
    return fetchedRachadinhaData;
  }, [fetchedRachadinhaData, rachadinhaId]);

  const { data: appSettings, isLoading: isLoadingAppSettings } = useQuery({
    queryKey: ['appSettings'],
    queryFn: getAppSettings,
  });

  return {
    rachadinhaData,
    appSettings,
    isLoading: isLoadingRachadinha || isLoadingAppSettings,
  };
};
