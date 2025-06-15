
import { Product } from '@/types/product';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105">
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        <CardHeader className="p-0">
          <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <CardDescription className="mt-1">{product.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <p className="text-xl font-semibold w-full">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default ProductCard;
