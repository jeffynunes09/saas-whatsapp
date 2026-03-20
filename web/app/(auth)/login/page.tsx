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
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      router.push('/');
    } catch {
      // error já no state
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-center text-gray-800">Entrar</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
        <Button type="submit" loading={loading}>Entrar</Button>
      </form>
      <div className="flex flex-col gap-2 text-center text-sm text-gray-500">
        <Link href="/forgot-password" className="hover:text-primary">Esqueci minha senha</Link>
        <span>
          Não tem conta?{' '}
          <Link href="/register" className="text-primary font-medium">Cadastrar</Link>
        </span>
      </div>
    </Card>
  );
}
