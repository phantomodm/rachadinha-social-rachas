
import { useState } from "react";
import Header from "@/components/Header";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
            Nossa Loja
          </h1>
          <p className="text-lg text-muted-foreground">
            Confira nossos produtos incríveis!
          </p>
        </section>

        <section className="mb-8 flex justify-end">
          <div className="w-full sm:w-auto sm:min-w-[240px]">
            <Select onValueChange={setSelectedCategory} defaultValue="all">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "Todas as categorias" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                Nenhum produto encontrado nesta categoria.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StorePage;
