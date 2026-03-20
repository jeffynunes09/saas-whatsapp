'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIntents } from '@/hooks/useIntents';
import { IntentType, IntentField, FieldType } from '@/services/intentService';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const intentTypes: { value: IntentType; label: string; desc: string; emoji: string }[] = [
  { value: 'schedule', label: 'Agendamento', desc: 'Bot coleta dados e cria um agendamento', emoji: '📅' },
  { value: 'order', label: 'Pedido', desc: 'Bot coleta dados e registra um pedido', emoji: '🛒' },
  { value: 'info', label: 'Informação', desc: 'Bot responde com informações do negócio', emoji: '💬' },
  { value: 'handoff', label: 'Escalada', desc: 'Bot transfere para atendimento humano', emoji: '🙋' },
];

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'date', label: 'Data' },
  { value: 'time', label: 'Horário' },
  { value: 'phone', label: 'Telefone' },
  { value: 'number', label: 'Número' },
  { value: 'select', label: 'Opções' },
];

const defaultConfirmation: Record<IntentType, string> = {
  schedule: 'Perfeito! Seu agendamento foi registrado. Entraremos em contato para confirmar.',
  order: 'Pedido recebido! Em breve nossa equipe irá confirmar.',
  info: 'Espero ter ajudado! Tem mais alguma dúvida?',
  handoff: 'Vou chamar um atendente para te ajudar. Aguarde um momento!',
};

export default function NewIntentPage() {
  const router = useRouter();
  const { create } = useIntents();

  const [name, setName] = useState('');
  const [type, setType] = useState<IntentType>('schedule');
  const [phrases, setPhrases] = useState<string[]>([]);
  const [phraseInput, setPhraseInput] = useState('');
  const [fields, setFields] = useState<IntentField[]>([]);
  const [confirmation, setConfirmation] = useState(defaultConfirmation.schedule);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // novo campo em construção
  const [newField, setNewField] = useState<IntentField>({ name: '', label: '', type: 'text', required: true });
  const [addingField, setAddingField] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const handleTypeChange = (t: IntentType) => {
    setType(t);
    setConfirmation(defaultConfirmation[t]);
  };

  const addPhrase = () => {
    const p = phraseInput.trim();
    if (p.length < 2 || phrases.includes(p)) return;
    setPhrases((prev) => [...prev, p]);
    setPhraseInput('');
  };

  const removePhrase = (p: string) => setPhrases((prev) => prev.filter((x) => x !== p));

  const addField = () => {
    if (!newField.label || !newField.name) return;
    const field: IntentField = {
      ...newField,
      name: newField.name.toLowerCase().replace(/\s+/g, '_'),
      options: newField.type === 'select' ? newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
    };
    setFields((prev) => [...prev, field]);
    setNewField({ name: '', label: '', type: 'text', required: true });
    setNewFieldOptions('');
    setAddingField(false);
  };

  const removeField = (idx: number) => setFields((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!name.trim()) { setError('Nome obrigatório'); return; }
    if (phrases.length === 0) { setError('Adicione pelo menos uma frase de ativação'); return; }
    if (!confirmation.trim()) { setError('Mensagem de confirmação obrigatória'); return; }

    setSaving(true);
    setError('');
    try {
      await create({
        name,
        intent_type: type,
        trigger_phrases: phrases,
        fields,
        confirmation_message: confirmation,
      });
      router.push('/intents');
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header title="Novo Comportamento" subtitle="Configure o que o bot fará" />
      <div className="px-4 flex flex-col gap-4 pb-6">

        {/* Nome */}
        <Card className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500">Nome</h2>
          <Input
            placeholder="Ex: Agendar consulta, Fazer pedido..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Card>

        {/* Tipo */}
        <Card className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500">Tipo de comportamento</h2>
          <div className="grid grid-cols-2 gap-2">
            {intentTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleTypeChange(t.value)}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-colors ${
                  type === t.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                <span className={`text-xs font-semibold ${type === t.value ? 'text-primary' : 'text-gray-700'}`}>
                  {t.label}
                </span>
                <span className="text-[10px] text-gray-400 leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Frases de ativação */}
        <Card className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Frases que ativam este comportamento</h2>
            <p className="text-xs text-gray-400 mt-0.5">O bot reconhece quando o cliente diz algo parecido</p>
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-300 outline-none focus:border-primary"
              placeholder="Ex: quero agendar, marcar horário..."
              value={phraseInput}
              onChange={(e) => setPhraseInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhrase())}
            />
            <button
              type="button"
              onClick={addPhrase}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl"
            >
              +
            </button>
          </div>
          {phrases.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {phrases.map((p) => (
                <span key={p} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {p}
                  <button onClick={() => removePhrase(p)} className="text-primary/60 hover:text-primary ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Campos a coletar (só para schedule/order) */}
        {(type === 'schedule' || type === 'order') && (
          <Card className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Dados a coletar</h2>
              <p className="text-xs text-gray-400 mt-0.5">O bot perguntará cada campo em sequência</p>
            </div>

            {fields.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-gray-700">{f.label}</p>
                  <p className="text-[10px] text-gray-400">{fieldTypes.find((t) => t.value === f.type)?.label} · {f.required ? 'obrigatório' : 'opcional'}</p>
                </div>
                <button onClick={() => removeField(idx)} className="text-red-400 text-xs hover:text-red-600">remover</button>
              </div>
            ))}

            {addingField ? (
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl">
                <Input
                  label="Nome do campo (exibido para o cliente)"
                  placeholder="Ex: Nome completo, Data preferida..."
                  value={newField.label}
                  onChange={(e) => setNewField((f) => ({
                    ...f,
                    label: e.target.value,
                    name: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                  }))}
                />
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Tipo</label>
                  <div className="grid grid-cols-3 gap-1">
                    {fieldTypes.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setNewField((f) => ({ ...f, type: t.value }))}
                        className={`py-1.5 text-xs rounded-lg border transition-colors ${
                          newField.type === t.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-500'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                {newField.type === 'select' && (
                  <Input
                    label="Opções (separadas por vírgula)"
                    placeholder="Ex: Manhã, Tarde, Noite"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                  />
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newField.required}
                    onChange={(e) => setNewField((f) => ({ ...f, required: e.target.checked }))}
                    className="accent-primary"
                  />
                  <label htmlFor="required" className="text-xs text-gray-600">Campo obrigatório</label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addField}
                    disabled={!newField.label}
                    className="flex-1 py-2 text-xs font-medium bg-primary text-white rounded-xl disabled:opacity-50"
                  >
                    Adicionar campo
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingField(false)}
                    className="flex-1 py-2 text-xs text-gray-500 bg-gray-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingField(true)}
                className="w-full py-2.5 text-xs font-medium text-primary border border-dashed border-primary/40 rounded-xl hover:bg-primary/5 transition-colors"
              >
                + Adicionar campo
              </button>
            )}
          </Card>
        )}

        {/* Mensagem de confirmação */}
        <Card className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Mensagem ao finalizar</h2>
            <p className="text-xs text-gray-400 mt-0.5">O bot envia essa mensagem quando tudo foi coletado</p>
          </div>
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary text-sm outline-none resize-none"
            rows={3}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </Card>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Button onClick={handleSave} loading={saving}>
          Salvar comportamento
        </Button>
      </div>
    </div>
  );
}
