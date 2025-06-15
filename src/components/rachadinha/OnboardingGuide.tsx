
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, FileText } from 'lucide-react';

const OnboardingGuide = () => {
  return (
    <Card className="bg-muted/30 border-dashed animate-fade-in">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Bem-vindo(a) à sua nova Rachadinha!</h2>
          <p className="text-muted-foreground">Siga estes 3 passos simples para dividir a conta:</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center p-4">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">1. Adicione a Galera</h3>
            <p className="text-sm text-muted-foreground">Comece adicionando quem vai participar da rachadinha.</p>
          </div>
          <div className="flex flex-col items-center p-4 opacity-50">
             <div className="bg-primary/10 p-3 rounded-full mb-3">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">2. Lance os Itens</h3>
            <p className="text-sm text-muted-foreground">Depois, adicione os itens e quem consumiu cada um.</p>
          </div>
          <div className="flex flex-col items-center p-4 opacity-50">
             <div className="bg-primary/10 p-3 rounded-full mb-3">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">3. Veja a Conta</h3>
            <p className="text-sm text-muted-foreground">A conta final é calculada automaticamente para cada pessoa.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingGuide;
