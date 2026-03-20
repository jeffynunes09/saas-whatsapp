export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">ZapBot</h1>
          <p className="text-sm text-gray-500 mt-1">Atendimento WhatsApp com IA</p>
        </div>
        {children}
      </div>
    </div>
  );
}
