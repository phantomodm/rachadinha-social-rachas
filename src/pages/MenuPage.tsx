
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRachadinhaData, addItem, removeItem, toggleItemParticipant } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import ItemsCard from '@/components/rachadinha/ItemsCard';
import { toast } from 'sonner';

const MenuPage = () => {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const { data: rachadinhaData, isLoading } = useQuery({
        queryKey: ['rachadinha', id],
        queryFn: () => getRachadinhaData(id!),
        enabled: !!id,
    });

    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');

    const onSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['rachadinha', id] });
    };

    const addItemMutation = useMutation({
        mutationFn: (variables: { name: string; price: number; participantIds: string[] }) =>
            addItem(id!, variables.name, variables.price, variables.participantIds),
        onSuccess: () => {
            onSuccess();
            setNewItemName('');
            setNewItemPrice('');
            toast.success("Item adicionado com sucesso!");
        },
        onError: (error: Error) => {
            toast.error(`Erro ao adicionar item: ${error.message}`);
        }
    });

    const removeItemMutation = useMutation({
        mutationFn: (itemId: string) => removeItem(itemId),
        onSuccess: () => {
            onSuccess();
            toast.success("Item removido com sucesso!");
        },
        onError: (error: Error) => {
            toast.error(`Erro ao remover item: ${error.message}`);
        }
    });

    const toggleItemParticipantMutation = useMutation({
        mutationFn: (variables: { itemId: string; participantId: string; isMember: boolean; }) =>
            toggleItemParticipant(variables.itemId, variables.participantId, variables.isMember),
        onSuccess,
        onError: (error: Error) => {
            toast.error(`Erro ao atualizar participante: ${error.message}`);
        }
    });

    const renderContent = () => {
        if (isLoading) {
            return <Skeleton className="h-64 w-full rounded-lg" />;
        }
        if (!rachadinhaData) {
            return <p>Não foi possível carregar os dados da rachadinha.</p>;
        }

        if (rachadinhaData.vendors?.has_menu) {
            return (
                <div className="border rounded-lg p-12 text-center bg-card shadow-sm">
                    <p className="text-xl font-semibold text-primary">Em Breve</p>
                    <p className="text-muted-foreground mt-2">Funcionalidade de E-commerce em desenvolvimento.</p>
                </div>
            );
        } else {
             if (rachadinhaData.participants.length === 0) {
                return (
                    <div className="border rounded-lg p-12 text-center bg-card shadow-sm">
                        <p className="text-xl font-semibold">Adicione participantes primeiro</p>
                        <p className="text-muted-foreground mt-2">Para adicionar itens, você precisa primeiro adicionar participantes na página da rachadinha.</p>
                    </div>
                )
             }

            return (
                <ItemsCard
                    items={rachadinhaData.items}
                    participants={rachadinhaData.participants}
                    newItemName={newItemName}
                    setNewItemName={setNewItemName}
                    newItemPrice={newItemPrice}
                    setNewItemPrice={setNewItemPrice}
                    addItemMutation={addItemMutation}
                    removeItemMutation={removeItemMutation}
                    toggleItemParticipantMutation={toggleItemParticipantMutation}
                />
            );
        }
    };


    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Cardápio do Restaurante</h1>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                        {isLoading ? 'Carregando...' :
                            rachadinhaData?.vendors?.has_menu
                            ? "Este é o cardápio do estabelecimento parceiro. Em breve você poderá adicionar itens diretamente à sua rachadinha por aqui!"
                            : "Este estabelecimento não possui um cardápio digital. Adicione os itens manualmente abaixo."
                        }
                    </p>
                </div>
                
                {renderContent()}
                
                <div className="text-center">
                    <Button asChild variant="outline" className="mt-8">
                        <Link to={`/rachadinha/${id}`}>
                            Voltar para a Rachadinha
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default MenuPage;
