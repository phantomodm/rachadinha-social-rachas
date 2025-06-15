
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  updateServiceCharge,
  addParticipant,
  removeParticipant,
  addItem,
  removeItem,
  toggleItemParticipant,
  bulkAddParticipants,
} from '@/lib/api';

export const useRachadinhaMutations = (rachadinhaId: string) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const createMutation = <TVariables,>(fn: (variables: TVariables) => Promise<unknown>, entity: string) => useMutation({
        mutationFn: fn,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['rachadinha', rachadinhaId] });
        },
        onError: (error: Error) => {
          toast({ title: 'Erro', description: `Não foi possível ${entity}: ${error.message}`, variant: 'destructive' });
        }
    });

    const serviceChargeMutation = useMutation({
        mutationFn: (newVal: number) => updateServiceCharge(rachadinhaId, newVal),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rachadinha', rachadinhaId] });
        },
        onError: (error: Error) => {
          toast({ title: 'Erro', description: `Não foi possível atualizar a taxa de serviço: ${error.message}`, variant: 'destructive' });
        }
    });

    const addParticipantMutation = createMutation((name: string) => addParticipant(rachadinhaId, name), 'adicionar participante');
    const bulkAddParticipantsMutation = createMutation((names: string[]) => bulkAddParticipants(rachadinhaId, names), 'adicionar participantes');
    const removeParticipantMutation = createMutation(removeParticipant, 'remover participante');
    const addItemMutation = createMutation((vars: { name: string, price: number, participantIds: string[] }) => addItem(rachadinhaId, vars.name, vars.price, vars.participantIds), 'adicionar item');
    const removeItemMutation = createMutation(removeItem, 'remover item');
    const toggleItemParticipantMutation = createMutation((vars: { itemId: string, participantId: string, isMember: boolean }) => toggleItemParticipant(vars.itemId, vars.participantId, vars.isMember), 'atualizar item');

    return {
        serviceChargeMutation,
        addParticipantMutation,
        bulkAddParticipantsMutation,
        removeParticipantMutation,
        addItemMutation,
        removeItemMutation,
        toggleItemParticipantMutation,
    };
};
