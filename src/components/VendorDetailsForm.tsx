
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateVendorDetails, addPixKeyForVendor, type Vendor } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const pixKeyTypes = [
    { value: 'CPF/CNPJ', label: 'CPF/CNPJ' },
    { value: 'Email', label: 'E-mail' },
    { value: 'Phone', label: 'Celular' },
    { value: 'Random', label: 'Chave Aleatória' },
];

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome do restaurante deve ter pelo menos 2 caracteres." }),
  pix_key_type: z.string({ required_error: "Selecione um tipo de chave PIX." }),
  pix_key_value: z.string().min(5, { message: "A chave PIX é muito curta." }),
});

interface VendorDetailsFormProps {
    vendor: Vendor;
    onSuccess?: () => void;
}

const VendorDetailsForm = ({ vendor, onSuccess }: VendorDetailsFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: vendor.name || '',
      pix_key_type: '',
      pix_key_value: '',
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: (values: { vendorId: string; name: string }) => updateVendorDetails(values.vendorId, { name: values.name }),
  });

  const addPixKeyMutation = useMutation({
    mutationFn: (values: { vendor_id: string; pix_key_type: string; pix_key_value: string }) => addPixKeyForVendor(values),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        if (vendor.name !== values.name) {
            await updateVendorMutation.mutateAsync({ vendorId: vendor.id, name: values.name });
        }
      
        await addPixKeyMutation.mutateAsync({
            vendor_id: vendor.id,
            pix_key_type: values.pix_key_type,
            pix_key_value: values.pix_key_value,
        });

      toast({
        title: "Sucesso!",
        description: "Seus dados de vendedor foram salvos.",
      });
      queryClient.invalidateQueries({ queryKey: ['vendor', vendor.user_id] });
      queryClient.invalidateQueries({ queryKey: ['vendorPixKeys', vendor.id] });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar seus dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const isSubmitting = updateVendorMutation.isPending || addPixKeyMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg mx-auto">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Restaurante</FormLabel>
              <FormControl>
                <Input placeholder="Seu Restaurante" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pix_key_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Chave PIX</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo da chave" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pixKeyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pix_key_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chave PIX</FormLabel>
              <FormControl>
                <Input placeholder="Sua chave PIX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Cadastro
        </Button>
      </form>
    </Form>
  );
};

export default VendorDetailsForm;
