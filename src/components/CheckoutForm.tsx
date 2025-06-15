
import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "O nome é obrigatório." }),
  lastName: z.string().min(1, { message: "O sobrenome é obrigatório." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  phone: z.string().min(1, { message: "O telefone é obrigatório." }),
  country: z.string().min(1, { message: "O país é obrigatório." }),
  address: z.string().min(1, { message: "O endereço é obrigatório." }),
  city: z.string().min(1, { message: "A cidade é obrigatória." }),
  state: z.string().min(1, { message: "O estado é obrigatório." }),
  postalCode: z.string().min(1, { message: "O CEP é obrigatório." }),
});

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: 'BR',
      address: '',
      city: '',
      state: '',
      postalCode: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
        payment_method_data: {
          billing_details: {
            name: `${values.firstName} ${values.lastName}`,
            email: values.email,
            phone: values.phone,
            address: {
              line1: values.address,
              city: values.city,
              state: values.state,
              postal_code: values.postalCode,
              country: values.country,
            },
          },
        },
      },
    });

    if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          toast({
            title: "Erro no pagamento",
            description: error.message,
            variant: "destructive",
          });
        } else {
            toast({
                title: "Erro inesperado",
                description: "Ocorreu um erro inesperado.",
                variant: "destructive",
            });
        }
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form id="payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Detalhes de cobrança</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="João" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobrenome</FormLabel>
                  <FormControl>
                    <Input placeholder="Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao.silva@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4">
             <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um país" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BR">Brasil</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4">
             <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua das Flores, 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Estado</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="01234-567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
        </div>

        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Pagamento</h2>
            <PaymentElement id="payment-element" />
        </div>
        
        <Button disabled={isLoading || !stripe || !elements} id="submit" className="w-full mt-6" type="submit">
          <span id="button-text">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Pagar agora'}
          </span>
        </Button>
      </form>
    </Form>
  );
};

export default CheckoutForm;
