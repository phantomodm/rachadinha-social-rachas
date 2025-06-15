
import { useQuery } from '@tanstack/react-query';
import { getRachadinhaData, getAppSettings } from '@/lib/api';

export const useRachadinhaData = (rachadinhaId: string) => {
  const { data: rachadinhaData, isLoading: isLoadingRachadinha } = useQuery({
    queryKey: ['rachadinha', rachadinhaId],
    queryFn: () => getRachadinhaData(rachadinhaId),
    enabled: !!rachadinhaId,
  });

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
