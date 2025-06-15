
import RachadinhaManager from '@/components/RachadinhaManager';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Users, Zap } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import RachadinhaNotifier from '@/components/RachadinhaNotifier';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const { session, loading, isAdmin } = useAuth();

  const scrollToCalculator = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {session && <RachadinhaNotifier />}
      <main className="container mx-auto px-4 py-8 md:py-16">
        
        {isAdmin && (
            <section className="mb-16">
                <AdminDashboard />
            </section>
        )}

        {/* Hero Section */}
        <section className="text-center py-16 md:py-24 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary mb-4">
            Rachadinha
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A forma mais fácil e divertida de dividir a conta com a galera. Chega de confusão na hora de pagar!
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Button size="lg" asChild>
              <Link to="/create-rachadinha">
                Começar uma Rachadinha
                <Zap className="ml-2 h-5 w-5"/>
              </Link>
            </Button>
            {session && (
              <Button size="lg" variant="outline" asChild>
                <Link to="/contacts">
                  <Users className="mr-2 h-5 w-5"/>
                  Meus Contatos
                </Link>
              </Button>
            )}
          </div>
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
             {loading ? (
              <div className="text-center"><p>Carregando...</p></div>
            ) : session ? (
              <RachadinhaManager />
            ) : (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Faça login para começar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">Você precisa estar logado para criar e gerenciar uma rachadinha.</p>
                  <Button asChild size="lg">
                    <Link to="/auth">Fazer Login ou Criar Conta</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

      </main>
      <footer className="text-center py-6 border-t">
        <div className="container mx-auto space-y-2">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-x-6 gap-y-2">
                <p className="text-sm text-muted-foreground">Feito com ❤️ em Ilhéus, para o mundo.</p>
                <Link to="/support" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Central de Ajuda
                </Link>
            </div>
            <p className="text-sm text-muted-foreground/80">Criado com Lovable.dev</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
