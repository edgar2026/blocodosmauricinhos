
import React, { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';
import { CheckCircle, ChevronDown, ArrowLeft, Loader2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, EventSettings } from '../lib/supabase';

const RegistrationForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<EventSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('event_settings')
        .select('*')
        .eq('id', 'current_event')
        .single();
      if (error) throw error;
      setSettings(data);
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    unit: ''
  });

  // Mask functions
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, cpf: maskCPF(e.target.value) });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: maskPhone(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Save to Supabase
      const { error: insertError } = await supabase
        .from('participants')
        .insert([
          {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            cpf: formData.cpf,
            unit: formData.unit
          }
        ]);

      if (insertError) {
        if (insertError.code === '23505') {
          // Unique constraint violation (CPF already exists)
          setError('Este CPF já está cadastrado. Se você já se inscreveu, não é necessário se inscrever novamente.');
        } else {
          setError('Erro ao processar inscrição. Tente novamente.');
        }
        setLoading(false);
        return;
      }

      // Clear form after successful submission
      setFormData({ name: '', phone: '', email: '', cpf: '', unit: '' });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({ name: '', phone: '', email: '', cpf: '', unit: '' });
    setSubmitted(false);
    setError(null);
  };

  return (
    <div
      className="min-h-screen bg-carnival-pattern flex flex-col items-center"
      style={{
        '--primary-color': settings?.primary_color || '#002D5B',
        '--secondary-color': settings?.secondary_color || '#FFD100',
        '--accent-color': settings?.accent_color || '#E63946',
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="w-full glass-card py-4 px-8 flex items-center justify-center border-b-4 border-[#FFD100] shadow-xl mb-12 sticky top-0 z-50 relative">
        <Logo className="h-12 md:h-16" />
        {/* Painel Admin Invisível aqui também para manter o padrão */}
        <Link
          to="/dashboard"
          className="absolute right-8 text-[#002D5B] opacity-0 hover:opacity-100 transition-all font-black text-[8px] uppercase tracking-widest"
        >
          Acesso Restrito
        </Link>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-2xl px-4 pb-20 relative z-10">
        <div className="glass-card rounded-[3rem] border-2 border-white/40 shadow-2xl p-10 backdrop-blur-2xl relative">
          <Link to="/" className="absolute left-8 top-8 group">
            <div className="p-3 bg-[var(--secondary-color)] rounded-2xl group-hover:bg-[var(--primary-color)] group-hover:text-white transition-all shadow-lg flex items-center justify-center">
              <ArrowLeft size={20} />
            </div>
          </Link>

          <div className="mb-10 text-center">
            <span className="bg-[var(--secondary-color)]/20 text-[var(--primary-color)] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em]">{settings?.edition} • Garanta sua Vaga</span>
            <h2 className="text-[var(--primary-color)] text-3xl font-black mt-4 uppercase">Garanta sua Entrada</h2>
            <p className="text-gray-500 font-medium italic mt-1">Vagas limitadas para o {settings?.year_label}!</p>
          </div>

          {submitted ? (
            <div className="text-center py-10 animate-fade-in">
              <div className="bg-[#2A9D8F] text-white px-8 py-10 rounded-3xl flex flex-col items-center space-y-6 mb-10 shadow-[0_15px_30px_rgba(42,157,143,0.3)]">
                <div className="bg-white/20 p-5 rounded-full ring-8 ring-white/10">
                  <CheckCircle size={48} />
                </div>
                <div>
                  <p className="font-black text-2xl uppercase italic leading-none">Inscrição realizada!</p>
                  <p className="text-base font-medium opacity-90 mt-4 max-w-sm mx-auto">
                    Parabéns! Sua vaga no estandarte está garantida. Apresente seu <strong>1kg de alimento</strong> no ponto de retirada.
                  </p>
                </div>
                <button
                  onClick={clearForm}
                  className="mt-8 bg-white text-[#2A9D8F] font-black py-4 px-10 rounded-2xl uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl"
                >
                  Fazer Nova Inscrição
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-8 py-6 rounded-3xl flex items-start space-x-4 mb-10 animate-shake">
                  <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 group">
                    <label className="text-[#002D5B] font-black text-[10px] uppercase tracking-widest ml-1">Nome completo</label>
                    <input
                      type="text"
                      className="w-full bg-white/50 border-2 border-[#002D5B]/5 rounded-2xl px-6 py-4 focus:border-[#FFD100] focus:bg-white focus:outline-none transition-all font-bold placeholder:text-gray-300"
                      placeholder="Ex: João Mauricio"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[#002D5B] font-black text-[10px] uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="(81) 90000-0000"
                      className="w-full bg-white/50 border-2 border-[#002D5B]/5 rounded-2xl px-6 py-4 focus:border-[#FFD100] focus:bg-white focus:outline-none transition-all font-bold placeholder:text-gray-300"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[#002D5B] font-black text-[10px] uppercase tracking-widest ml-1">E-mail Institucional</label>
                    <input
                      type="email"
                      placeholder="usuario@uninassau.edu.br"
                      className="w-full bg-white/50 border-2 border-[#002D5B]/5 rounded-2xl px-6 py-4 focus:border-[#FFD100] focus:bg-white focus:outline-none transition-all font-bold placeholder:text-gray-300"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[#002D5B] font-black text-[10px] uppercase tracking-widest ml-1">Documento (CPF)</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      className="w-full bg-white/50 border-2 border-[#002D5B]/5 rounded-2xl px-6 py-4 focus:border-[#FFD100] focus:bg-white focus:outline-none transition-all font-bold placeholder:text-gray-300"
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      maxLength={14}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[#002D5B] font-black text-[10px] uppercase tracking-widest ml-1 flex items-center gap-2">
                    Ponto de Retirada da Pulseira <span className="text-[#E63946]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white/50 border-2 border-[#002D5B]/5 rounded-2xl px-6 py-4 focus:border-[#FFD100] focus:bg-white focus:outline-none transition-all font-bold bg-white"
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      required
                    >
                      <option value="" disabled>Escolha sua unidade</option>
                      <option value="Graças">Graças</option>
                      <option value="Boa Viagem">Boa Viagem</option>
                      <option value="Paulista">Paulista</option>
                      <option value="Olinda">Olinda</option>
                      <option value="Caxangá">Caxangá</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#FFD100]">
                      <ChevronDown size={24} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                  <button
                    type="button"
                    onClick={clearForm}
                    className="w-full sm:w-1/3 border-2 border-[#002D5B]/10 text-[#002D5B]/40 font-black py-4 rounded-[1.5rem] hover:bg-white hover:text-[#E63946] hover:border-[#E63946] transition-all uppercase text-xs tracking-widest"
                  >
                    Limpar Campos
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-2/3 bg-[#E63946] text-white font-black py-5 rounded-[1.5rem] hover:bg-[#D62828] transition-all uppercase tracking-widest shadow-[0_15px_30px_rgba(230,57,70,0.3)] hover:shadow-[0_20px_40px_rgba(230,57,70,0.5)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Finalizar Inscrição ✨'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
