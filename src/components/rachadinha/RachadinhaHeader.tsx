
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { RachadinhaData } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';

interface RachadinhaHeaderProps {
    rachadinhaData: RachadinhaData;
    totalBill: number;
}

const RachadinhaHeader = ({ rachadinhaData, totalBill }: RachadinhaHeaderProps) => {
    const { name, participants } = rachadinhaData;
    const participantCount = participants.length;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-2xl">{name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{participantCount} participante(s)</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total da Conta</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalBill)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RachadinhaHeader;
