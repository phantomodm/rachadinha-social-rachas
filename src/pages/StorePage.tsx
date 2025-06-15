
import Header from "@/components/Header";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const StorePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
            Nossa Loja
          </h1>
          <p className="text-lg text-muted-foreground">
            Confira nossos produtos incríveis!
          </p>
        </section>
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StorePage;
