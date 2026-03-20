'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, loading, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.email, data.password, data.name);
      router.push('/login');
    } catch {
      // error já no state
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-center text-gray-800">Criar conta</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Input
          label="Nome"
          placeholder="Seu nome"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Senha"
          type="password"
          placeholder="••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        <Button type="submit" loading={loading}>Criar conta</Button>
      </form>
      <p className="text-center text-sm text-gray-500">
        Já tem conta?{' '}
        <Link href="/login" className="text-primary font-medium">Entrar</Link>
      </p>
    </Card>
  );
}
