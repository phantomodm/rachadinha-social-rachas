
import { useLocalStorage } from './useLocalStorage';
import { Participant } from '@/lib/api';

interface GuestSession {
  participantId: string;
  rachadinhaId: string;
  name: string;
}

// We store an object where keys are rachadinhaIds
type GuestStorage = Record<string, GuestSession>;

export const useGuest = (rachadinhaId?: string) => {
  const [guestData, setGuestData] = useLocalStorage<GuestStorage>('guestSessions', {});

  const currentGuestSession = rachadinhaId ? guestData[rachadinhaId] : undefined;

  const loginAsGuest = (participant: Participant) => {
    const newSession: GuestSession = {
      participantId: participant.id,
      rachadinhaId: participant.rachadinha_id,
      name: participant.name,
    };
    setGuestData(prev => ({
      ...prev,
      [participant.rachadinha_id]: newSession,
    }));
  };

  const logoutGuest = (rachadinhaIdToLogout: string) => {
    setGuestData(prev => {
      const newState = { ...prev };
      delete newState[rachadinhaIdToLogout];
      return newState;
    });
  };

  return {
    guestSession: currentGuestSession,
    loginAsGuest,
    logoutGuest,
    isGuest: !!currentGuestSession,
  };
};
