
import { useState, useEffect } from 'react';
import { RachadinhaData } from '@/lib/api';

export const useRachadinhaState = (rachadinhaData?: RachadinhaData) => {
    const [newParticipantName, setNewParticipantName] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [localServiceCharge, setLocalServiceCharge] = useState(rachadinhaData?.service_charge ?? 10);
    const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (rachadinhaData) {
          setLocalServiceCharge(rachadinhaData.service_charge);
        }
    }, [rachadinhaData]);
      
    const togglePaidStatus = (participantId: string) => {
        setPaidStatus(prev => ({ ...prev, [participantId]: !prev[participantId] }));
    };

    return {
        newParticipantName, setNewParticipantName,
        newItemName, setNewItemName,
        newItemPrice, setNewItemPrice,
        localServiceCharge, setLocalServiceCharge,
        paidStatus,
        togglePaidStatus,
    };
};
