'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="text-center flex flex-col gap-3">
        <p className="text-4xl">📧</p>
        <p className="font-semibold text-gray-800">E-mail enviado!</p>
        <p className="text-sm text-gray-500">Verifique sua caixa de entrada para redefinir a senha.</p>
        <Link href="/login" className="text-primary text-sm font-medium">Voltar ao login</Link>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-center text-gray-800">Recuperar senha</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" loading={loading}>Enviar link</Button>
      </form>
      <Link href="/login" className="text-center text-sm text-primary">Voltar ao login</Link>
    </Card>
  );
}
