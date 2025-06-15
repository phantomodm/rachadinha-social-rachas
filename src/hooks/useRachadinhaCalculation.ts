
import { useMemo } from 'react';
import { RachadinhaData, AppSettings } from '@/lib/api';

export const useRachadinhaCalculation = (rachadinhaData?: RachadinhaData, appSettings?: AppSettings) => {
  const calculation = useMemo(() => {
    if (!rachadinhaData || !appSettings) return { participantBreakdowns: {}, participantTotals: {}, totalBill: 0, totalServiceCharge: 0, totalWithoutService: 0, totalRachadinhaFee: 0 };
    
    const { participants, items, service_charge } = rachadinhaData;
    const rachadinha_fee = Number(appSettings?.rachadinha_fee || 1);

    const participantBreakdowns: Record<string, {
        individualItemsTotal: number;
        sharedItemsShare: number;
        subtotal: number;
        serviceChargePortion: number;
        rachadinhaFee: number;
        total: number;
    }> = {};

    let totalConsumed = 0;

    participants.forEach(p => {
        participantBreakdowns[p.id] = {
            individualItemsTotal: 0,
            sharedItemsShare: 0,
            subtotal: 0,
            serviceChargePortion: 0,
            rachadinhaFee: Number(rachadinha_fee || 0),
            total: 0
        };
    });

    items.forEach(item => {
        const participantIds = item.item_participants.map(ip => ip.participant_id);
        const price = Number(item.price);
        
        if (participantIds.length > 0) {
            if (participantIds.length === 1) { // Individual item
                const pId = participantIds[0];
                if (participantBreakdowns[pId]) {
                    participantBreakdowns[pId].individualItemsTotal += price;
                }
            } else { // Shared item
                const share = price / participantIds.length;
                participantIds.forEach(pId => {
                    if (participantBreakdowns[pId]) {
                        participantBreakdowns[pId].sharedItemsShare += share;
                    }
                });
            }
        }
    });

    participants.forEach(p => {
        const breakdown = participantBreakdowns[p.id];
        breakdown.subtotal = breakdown.individualItemsTotal + breakdown.sharedItemsShare;
        totalConsumed += breakdown.subtotal;
    });
    
    const totalServiceCharge = totalConsumed * (Number(service_charge) / 100);
    const totalRachadinhaFee = participants.length * Number(rachadinha_fee || 0);

    participants.forEach(p => {
        const breakdown = participantBreakdowns[p.id];
        if (totalConsumed > 0) {
            breakdown.serviceChargePortion = (breakdown.subtotal / totalConsumed) * totalServiceCharge;
        }
        breakdown.total = breakdown.subtotal + breakdown.serviceChargePortion + breakdown.rachadinhaFee;
    });

    const totalBill = totalConsumed + totalServiceCharge + totalRachadinhaFee;

    const participantTotals: Record<string, number> = {};
    participants.forEach(p => {
        participantTotals[p.id] = participantBreakdowns[p.id]?.total || 0;
    });

    return { participantTotals, participantBreakdowns, totalBill, totalServiceCharge, totalWithoutService: totalConsumed, totalRachadinhaFee };
  }, [rachadinhaData, appSettings]);

  return calculation;
};
