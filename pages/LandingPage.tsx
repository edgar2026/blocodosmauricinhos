import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import {
  User,
  Music,
  MapPin,
  Calendar,
  ArrowRight,
  Clock,
  Gift,
  Heart,
  Star,
  Instagram,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase, Attraction, EventSettings } from '../lib/supabase';

const LandingPage: React.FC = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [settings, setSettings] = useState<EventSettings | null>(null);

  useEffect(() => {
    fetchAttractions();
    fetchSettings();

    // Subscribe to attractions real-time
    const attrChannel = supabase
      .channel('attractions_landing')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attractions' },
        () => fetchAttractions()
      )
      .subscribe();

    // Subscribe to settings real-time
    const settingsChannel = supabase
      .channel('settings_landing')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_settings' },
        () => fetchSettings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(attrChannel);
      supabase.removeChannel(settingsChannel);
    };
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

  const fetchAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .order('time', { ascending: true });
      if (error) throw error;
      setAttractions(data || []);
    } catch (err) {
      console.error('Erro ao buscar atrações:', err);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans bg-white"
      style={{
        '--primary-color': settings?.primary_color || '#0041B6',
        '--secondary-color': settings?.secondary_color || '#FFD100',
        '--accent-color': settings?.accent_color || '#E63946',
        fontFamily: "'Fredoka', sans-serif",
        color: 'var(--primary-color)'
      } as React.CSSProperties}
    >
      {/* Hero Section */}
      {settings?.show_hero !== false && (
        <section id="inicio" className="relative overflow-hidden w-full bg-[#FFD100] flex flex-col">
          {/* Main Art - Set to contain to show 100% of the file */}
          <div className="relative w-full">
            <img
              src="/hero-carnaval.png"
              alt="Carnaval Bloco dos Mauricinhos"
              className="w-full h-auto object-contain block"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/hero-carnaval.jpg';
              }}
            />

            {/* Hidden Admin Access - Visible only on hover */}
            <Link
              to="/dashboard"
              className="absolute top-4 right-4 z-50 p-4 bg-black/20 backdrop-blur-md rounded-full text-white opacity-0 hover:opacity-100 transition-all duration-300"
              title="Acesso Administrativo"
            >
              <User size={20} />
            </Link>

          </div>
        </section>
      )}


      {/* Details & Solidarity */}
      {settings?.show_solidarity !== false && (
        <section id="evento" className="py-20 px-4 md:px-12 bg-white relative z-30 -mt-10 rounded-t-[4rem] border-t border-gray-100 shadow-2xl">
          <div className="max-w-6xl mx-auto">
            {/* Action Section - Moved from Hero to here for a cleaner look */}
            <div className="flex flex-col items-center gap-6 mb-16 animate-modal-enter">
              <div className="bg-[#0041B6] text-white px-6 py-2 rounded-full font-black text-sm md:text-base uppercase tracking-[0.2em] shadow-xl flex items-center gap-3">
                <Clock size={18} className="text-[#FFD100]" />
                <span>Das 18 às 22 horas</span>
              </div>

              <Link
                to="/register"
                className="group relative bg-[#0041B6] hover:bg-[#FFD100] text-white hover:text-[#0041B6] font-black py-5 px-12 rounded-[2rem] text-xl uppercase transition-all shadow-[0_20px_40px_rgba(0,65,182,0.2)] hover:scale-105 active:scale-95 overflow-hidden border-2 border-[#0041B6]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {settings?.hero_cta_text || 'Garantir Inscrição'}
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>

            <div className="text-center mb-16">
              <p className="text-[#E63946] font-bold uppercase tracking-[0.3em] text-xs mb-2">Engajamento Social</p>
              <h2 className="text-[#0041B6] text-4xl md:text-5xl font-black uppercase tracking-tight">
                {settings?.solidarity_title || 'Alegria & Solidariedade'}
              </h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-br from-[#0041B6]/5 to-white p-10 md:p-14 rounded-[3.5rem] border-2 border-[#0041B6]/10 hover:border-[#FFD100]/50 transition-all group overflow-hidden relative shadow-xl">
                {/* Decorative Icons */}
                <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Gift size={250} />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                  <div className="bg-[#FFD100] p-8 rounded-[2.5rem] shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform flex-shrink-0">
                    <Heart className="text-[#0041B6] w-12 h-12" />
                  </div>

                  <div className="text-center md:text-left">
                    <h3 className="text-[#0041B6] font-black text-3xl md:text-4xl uppercase mb-6 leading-tight">
                      Entrada Solidária <br className="hidden md:block" />& Pulseira
                    </h3>

                    <div className="space-y-4">
                      <p className="text-gray-700 font-bold text-lg leading-relaxed italic">
                        Para garantir sua vaga na folia, o processo é simples e solidário:
                      </p>
                      <ul className="text-gray-600 font-medium text-base space-y-3">
                        <li className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-[#0041B6] text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                          <span>Faça sua <strong>inscrição online</strong> agora mesmo.</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-[#0041B6] text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                          <span>Leve <strong>1kg de alimento não perecível</strong> a um dos pontos de retirada.</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-[#0041B6] text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                          <span>Receba sua <strong>pulseira de acesso</strong> para o evento.</span>
                        </li>
                      </ul>
                      <p className="pt-4 text-[#0041B6] font-black uppercase text-sm tracking-wider border-t border-blue-50">
                        A pulseira garante seu acesso completo ao Bloco dos Maurinhos!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Schedule */}
      {settings?.show_schedule !== false && (
        <section id="programacao" className="py-24 px-4 md:px-12 bg-[#F8F9FA] relative">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex flex-col items-center mb-16 text-center">
              <h2 className="text-[#0041B6] text-4xl md:text-5xl font-black uppercase tracking-tight relative inline-block">
                {settings?.schedule_title || 'Programação Oficial'}
                <span className="block h-2 w-full bg-[#FFD100] rounded-full mt-2"></span>
              </h2>
            </div>

            <div className="space-y-6">
              {attractions.length === 0 ? (
                <div className="text-center py-20 bg-[#0041B6]/5 rounded-[3rem] border-4 border-dashed border-[#0041B6]/10 animate-pulse">
                  <Music className="w-16 h-16 text-[#0041B6]/10 mx-auto mb-4" />
                  <p className="text-2xl font-black text-[#0041B6] opacity-20 uppercase tracking-[0.3em]">Programação a ser definida</p>
                </div>
              ) : (
                attractions.map((item, idx) => {
                  const hasTime = !!item.time;
                  return (
                    <div
                      key={idx}
                      className={`group relative flex flex-col md:flex-row md:items-center p-8 md:p-12 mb-8 last:mb-0 rounded-[3rem] transition-all duration-700 ${item.is_featured
                        ? 'bg-gradient-to-br from-[#0041B6] to-[#002B7A] text-white shadow-[0_30px_60px_-15px_rgba(0,65,182,0.4)] scale-[1.03] border-2 border-[#FFD100]/30'
                        : 'bg-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_60px_-15px_rgba(0,65,182,0.1)] hover:-translate-y-2 border-2 border-transparent hover:border-[#0041B6]/10'
                        }`}
                    >
                      {/* Timeline Connector - Only on Desktop and if there's a next item */}
                      {idx < attractions.length - 1 && (
                        <div className="hidden md:block absolute left-12 bottom-[-32px] w-0.5 h-8 bg-gradient-to-b from-[#0041B6]/20 to-transparent"></div>
                      )}

                      {/* Header/Time Section */}
                      <div className="flex items-center gap-6 mb-6 md:mb-0 md:w-48 shrink-0">
                        <div className={`w-16 h-16 flex items-center justify-center rounded-[1.5rem] shadow-inner transition-transform group-hover:rotate-6 ${item.is_featured ? 'bg-white/10' : 'bg-[#0041B6]/5 text-[#0041B6]'
                          }`}>
                          {item.type === 'dj' ? <Clock size={28} /> : <Music size={28} />}
                        </div>
                        {hasTime && (
                          <span className="text-3xl font-black tracking-tighter tabular-nums leading-none">
                            {item.time}
                          </span>
                        )}
                      </div>

                      {/* Info Section */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.is_featured
                            ? 'bg-[#FFD100] text-[#0041B6] border-[#FFD100]'
                            : 'bg-[#0041B6]/5 text-[#0041B6] border-[#0041B6]/10'
                            }`}>
                            {item.type === 'banda' ? 'Banda / Show' : item.type === 'dj' ? 'DJ Set' : 'Atração'}
                          </span>
                          {item.is_featured && (
                            <span className="bg-white/10 text-[#FFD100] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                              <Star size={10} fill="currentColor" /> Destaque
                            </span>
                          )}
                        </div>
                        <h3 className={`text-3xl md:text-4xl font-black uppercase tracking-tight leading-none ${item.is_featured ? 'text-white' : 'text-[#0041B6]'
                          }`}>
                          {item.name}
                        </h3>
                      </div>

                      {/* Call to action decorative */}
                      <div className="hidden md:flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${item.is_featured ? 'border-[#FFD100]/50 text-[#FFD100]' : 'border-[#0041B6]/20 text-[#0041B6]'
                          }`}>
                          <ArrowRight size={20} />
                        </div>
                      </div>

                      {/* Background Detail for Featured */}
                      {item.is_featured && (
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                          <Music size={120} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      {settings?.show_footer !== false && (
        <footer id="contato" className="bg-gradient-to-b from-[#0041B6] to-[#001a35] text-white pt-16 pb-6">
          <div className="px-4 md:px-12 pb-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

              {/* Left Column - Description */}
              <div className="flex flex-col space-y-4">
                <h3 className="text-[#FFD100] font-black text-xs uppercase tracking-[0.3em] mb-2">Sobre o Evento</h3>
                <p className="text-base text-blue-100/80 leading-relaxed font-light">
                  {settings?.about_text || 'Aprendizado que forma líderes, transforma histórias e faz o futuro desfilar com conhecimento, inovação e a energia vibrante do Carnaval da UNINASSAU.'}
                </p>
              </div>

              {/* Center Column - Location */}
              <div className="flex flex-col space-y-4">
                <h3 className="text-[#FFD100] font-black text-xs uppercase tracking-[0.3em] mb-2">Localização Estratégica</h3>
                <div className="flex items-start gap-3 text-blue-100/90">
                  <MapPin size={20} className="text-[#FFD100] mt-1 flex-shrink-0" />
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-line">
                    {settings?.footer_address || 'R. Fernando Lopes, 752 - Graças\nRecife - PE, 52011-220'}
                  </p>
                </div>

                {/* Social Media */}
                <div className="pt-4">
                  <a
                    href={`https://www.instagram.com/${(settings?.footer_instagram || '@uninassau').replace('@', '')}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-[#FFD100] text-white hover:text-[#0041B6] px-4 py-2.5 rounded-xl transition-all group"
                  >
                    <Instagram size={18} />
                    <span className="text-sm font-bold">{settings?.footer_instagram || '@uninassau'}</span>
                  </a>
                </div>
              </div>

              {/* Right Column - Contact */}
              <div className="flex flex-col space-y-4">
                <h3 className="text-[#FFD100] font-black text-xs uppercase tracking-[0.3em] mb-2">Contato Oficial</h3>
                <a
                  href={`tel:${(settings?.footer_phone || '(81) 3413-4611').replace(/\D/g, '')}`}
                  className="text-2xl font-black text-white hover:text-[#FFD100] transition-colors"
                >
                  {settings?.footer_phone || '(81) 3413-4611'}
                </a>
                <p className="text-xs text-blue-100/50 uppercase tracking-widest">Atendimento: Seg - Sex, 8h às 18h</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-6 px-4 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-blue-200/40 uppercase tracking-[0.4em] font-bold text-center md:text-left">
                {settings?.footer_copyright || '© 2026 UNINASSAU | Compromisso com a Educação e Cultura'}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FFD100] animate-pulse"></div>
                <span className="text-[9px] text-blue-200/30 uppercase tracking-widest font-semibold">
                  {settings?.edition || 'Bloco dos Mauricinhos'} - {settings?.year_label || 'Ano IV'}
                </span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default LandingPage;
