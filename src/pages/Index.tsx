
import RachadinhaCalculator from '@/components/RachadinhaCalculator';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Users, Zap } from 'lucide-react';

const Index = () => {
  const scrollToCalculator = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary mb-4">
            Rachadinha
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A forma mais fácil e divertida de dividir a conta com a galera. Chega de confusão na hora de pagar!
          </p>
          <Button size="lg" onClick={scrollToCalculator}>
            Começar uma Rachadinha
            <Zap className="ml-2 h-5 w-5"/>
          </Button>
        </section>

        {/* How it Works Section */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-sm animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Adicione a Galera</h3>
              <p className="text-muted-foreground">
                Cadastre os nomes de todos que estão participando da racha.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-sm animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="bg-secondary/10 p-4 rounded-full mb-4">
                <UtensilsCrossed className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Lance os Itens</h3>
              <p className="text-muted-foreground">
                Adicione cada item consumido e marque quem compartilhou o quê.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-sm animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="bg-accent/10 p-4 rounded-full mb-4">
                <Zap className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Divida a Conta</h3>
              <p className="text-muted-foreground">
                Veja o valor exato que cada um deve pagar, sem dor de cabeça!
              </p>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section id="calculator" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Sua Rachadinha</h2>
          <div className="max-w-4xl mx-auto">
            <RachadinhaCalculator />
          </div>
        </section>

      </main>
      <footer className="text-center py-6 border-t">
        <p className="text-muted-foreground">Feito com ❤️ em Ilhéus, para o mundo.</p>
        <p className="text-sm text-muted-foreground/80">Criado com Lovable.dev</p>
      </footer>
    </div>
  );
};

export default Index;
