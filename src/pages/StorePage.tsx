
import Header from "@/components/Header";
import { Store } from "lucide-react";

const StorePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <section className="text-center animate-fade-in">
          <Store className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
            Nossa Loja
          </h1>
          <p className="text-lg text-muted-foreground">
            Em breve, uma loja com produtos incríveis para você!
          </p>
        </section>
      </main>
    </div>
  );
};

export default StorePage;
