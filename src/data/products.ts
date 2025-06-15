
import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: '1',
    name: 'Tênis de Corrida',
    description: 'Leve e confortável para suas corridas diárias.',
    price: 299.90,
    imageUrl: '/placeholder.svg',
    category: 'Calçados',
    longDescription: 'Este tênis de corrida foi projetado com a mais alta tecnologia para proporcionar o máximo de conforto e performance. A sola de borracha oferece excelente tração e durabilidade, enquanto o cabedal em malha respirável mantém seus pés frescos. Ideal para corredores de todos os níveis.'
  },
  {
    id: '2',
    name: 'Camiseta Esportiva',
    description: 'Tecido que absorve o suor e mantém você seco.',
    price: 89.90,
    imageUrl: '/placeholder.svg',
    category: 'Vestuário',
    longDescription: 'Feita com tecido de poliamida de secagem rápida, esta camiseta é perfeita para seus treinos. O design ergonômico permite total liberdade de movimentos, e a tecnologia antiodor mantém você fresco por mais tempo.'
  },
  {
    id: '3',
    name: 'Garrafa de Água',
    description: 'Hidrate-se com estilo durante seus treinos.',
    price: 45.00,
    imageUrl: '/placeholder.svg',
    category: 'Acessórios',
    longDescription: 'Garrafa de água de 750ml, livre de BPA, com bico de fácil abertura e design ergonômico. Perfeita para levar para a academia, corridas ou para o dia a dia. Mantenha-se hidratado com praticidade e segurança.'
  },
  {
    id: '4',
    name: 'Relógio Esportivo',
    description: 'Monitore seu desempenho com precisão.',
    price: 750.00,
    imageUrl: '/placeholder.svg',
    category: 'Eletrônicos',
    longDescription: 'Relógio inteligente com GPS integrado, monitor de frequência cardíaca, contador de passos e calorias. Sincronize com seu smartphone para receber notificações e analisar seus dados de treino. Bateria de longa duração.'
  }
];
