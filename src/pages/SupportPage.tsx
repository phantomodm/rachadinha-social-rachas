
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import { Mail, MailQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqData = [
    {
        question: "O que é a Rachadinha?",
        answer: "A Rachadinha é um aplicativo projetado para simplificar a divisão de contas em grupo. Ele permite que você e seus amigos adicionem itens consumidos e dividam o total de forma justa e transparente, incluindo a taxa de serviço."
    },
    {
        question: "Como eu crio uma nova rachadinha?",
        answer: "Na tela inicial, clique no botão 'Começar uma Rachadinha'. Dê um nome para sua rachadinha (como o nome do restaurante ou evento) e pronto! Depois, você pode começar a adicionar participantes e itens."
    },
    {
        question: "Posso adicionar pessoas que não estão cadastradas no aplicativo?",
        answer: "Sim! Você pode adicionar qualquer pessoa à sua rachadinha apenas digitando o nome dela. Não é necessário que seus amigos tenham uma conta para participar da divisão."
    },
    {
        question: "Como a taxa de serviço é calculada?",
        answer: "A taxa de serviço (geralmente 10%) é aplicada sobre o subtotal dos itens de cada pessoa. O aplicativo calcula isso automaticamente e mostra o valor final que cada um deve pagar, já com a taxa inclusa."
    },
    {
        question: "O aplicativo é gratuito?",
        answer: "Sim, o uso principal do aplicativo para criar e gerenciar rachadinhas é totalmente gratuito. Podemos introduzir funcionalidades premium no futuro."
    },
    {
        question: "Meus dados estão seguros?",
        answer: "Levamos a segurança a sério. Seus dados são armazenados de forma segura e não compartilhamos suas informações pessoais com terceiros. Usamos autenticação segura para proteger sua conta."
    },
];

const SupportPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <section className="text-center mb-12 animate-fade-in">
          <MailQuestion className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
            Central de Ajuda
          </h1>
          <p className="text-lg text-muted-foreground">
            Tem alguma dúvida? Encontre as respostas aqui.
          </p>
        </section>

        <section className="max-w-3xl mx-auto mb-16 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes (FAQ)</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="text-center max-w-2xl mx-auto bg-card p-8 rounded-xl shadow-sm animate-fade-in" style={{animationDelay: '0.4s'}}>
            <h2 className="text-2xl font-bold mb-4">Ainda precisa de ajuda?</h2>
            <p className="text-muted-foreground mb-6">
                Se você não encontrou a resposta para sua pergunta, entre em contato conosco. Nossa equipe de suporte ficará feliz em ajudar.
            </p>
            <Button size="lg" asChild>
                <a href="mailto:suporte@rachadinha.app">
                    <Mail className="mr-2 h-5 w-5" />
                    Enviar um e-mail
                </a>
            </Button>
        </section>
      </main>
      <footer className="text-center py-6 border-t">
        <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
            <p className="text-muted-foreground">&copy; {new Date().getFullYear()} Rachadinha. Todos os direitos reservados.</p>
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Voltar ao Início
            </Link>
        </div>
      </footer>
    </div>
  );
};

export default SupportPage;
