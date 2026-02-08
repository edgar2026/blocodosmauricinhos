import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { User, Facebook, Twitter, Instagram, Youtube, Clock, Music, Calendar, MapPin, Heart, Gift, Star } from 'lucide-react';
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
        '--primary-color': settings?.primary_color || '#002D5B',
        '--secondary-color': settings?.secondary_color || '#FFD100',
        '--accent-color': settings?.accent_color || '#E63946',
        color: 'var(--primary-color)'
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="glass-card px-4 md:px-12 py-4 flex items-center justify-center shadow-sm sticky top-0 z-50 overflow-hidden">
        <Logo className="h-12 md:h-16" />

        {/* Subtle Admin access for managers */}
        <Link
          to="/dashboard"
          className="absolute right-4 md:right-12 px-5 py-2.5 bg-white/10 hover:bg-[var(--secondary-color)] text-white hover:text-[var(--primary-color)] rounded-xl transition-all shadow-sm border border-white/20 group flex items-center gap-3 backdrop-blur-md opacity-0 hover:opacity-100"
        >
          <User size={16} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Painel Gestor</span>
        </Link>
      </header>


      {/* Hero Section */}
      <section id="inicio" className="relative overflow-hidden min-h-[85vh] flex items-center justify-center bg-[#002D5B]">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0 bg-[#002D5B]">
          <img
            src={settings?.hero_image_url || "/hero-carnaval.jpg"}
            alt="Carnaval Bloco dos Mauricinhos"
            className="w-full h-full object-cover opacity-100 transition-opacity duration-1000"
            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src.includes('unsplash')) {
                target.src = '/hero-carnaval.jpg';
              } else {
                target.src = 'https://images.unsplash.com/photo-1590424614131-31835703f831?q=80&w=2000&auto=format&fit=crop';
              }
            }}
          />
          {/* Modern gradient overlay - adjusted for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-[var(--primary-color)]/90"></div>
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_black/40_100%)]"></div>
        </div>

        {/* Geometric accent shapes */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-[#FFD100] rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-20 w-24 h-24 border-4 border-white rotate-45"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-[#FFD100] rounded-lg animate-bounce"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 text-center px-6 max-w-6xl mx-auto py-20">
          {/* Event badge */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-[var(--secondary-color)] animate-pulse"></div>
            <span className="text-white text-sm font-bold uppercase tracking-[0.3em]">{settings?.edition || '4ª Edição'}</span>
          </div>

          {/* Main title */}
          <h1 className="mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            <span
              className="block text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.85] tracking-tight mb-2"
              style={{ color: settings?.title_main_color || '#FFFFFF' }}
            >
              {settings?.title_main || 'Bloco dos'}
            </span>
            <span
              className="block text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.85] tracking-tight"
              style={{ color: settings?.title_highlight_color || '#FFD100' }}
            >
              {settings?.title_highlight || 'Mauricinhos'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white text-lg md:text-xl font-bold max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-md">
            {settings?.subtitle || 'Celebra a cultura, solidariedade e a energia vibrante do Carnaval de Recife'}
          </p>

          {/* Date badge */}
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-[var(--secondary-color)] to-[#FFA500] rounded-2xl px-8 py-4 mb-12 shadow-2xl">
            <Calendar size={32} className="text-[var(--primary-color)]" />
            <div className="text-left">
              <p className="text-[var(--primary-color)] text-xs font-bold uppercase tracking-widest opacity-70">Data do Evento</p>
              <p className="text-[var(--primary-color)] text-3xl md:text-4xl font-black">{settings?.event_date || '27 de Fevereiro'}</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group relative bg-white hover:bg-[#FFD100] text-[#002D5B] font-black py-6 px-12 rounded-2xl text-xl uppercase transition-all shadow-2xl hover:shadow-[#FFD100]/50 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Garantir Inscrição
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Link>
          </div>

          {/* Quick info pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-16">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
              <Music size={16} className="text-[#FFD100]" />
              <span className="text-white text-xs font-semibold uppercase">Bandas Ao Vivo</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
              <Heart size={16} className="text-[#FFD100]" />
              <span className="text-white text-xs font-semibold uppercase">Entrada Solidária</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
              <Gift size={16} className="text-[#FFD100]" />
              <span className="text-white text-xs font-semibold uppercase">Pulseiras VIP</span>
            </div>
          </div>
        </div>

        {/* Bottom wave transition */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white" />
          </svg>
        </div>
      </section>


      {/* Details & Solidarity */}
      <section id="evento" className="py-24 px-4 md:px-12 bg-white relative z-30 -mt-16 rounded-t-[4rem] border-t border-gray-100 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#E63946] font-bold uppercase tracking-[0.3em] text-xs mb-2">Engajamento Social</p>
            <h2 className="text-[#002D5B] text-4xl md:text-5xl font-black uppercase tracking-tight">
              Alegria & Solidariedade
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-[3rem] border-2 border-[#002D5B]/5 hover:border-[#FFD100]/50 transition-all group overflow-hidden relative">
              <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Gift size={200} />
              </div>
              <div className="bg-[#FFD100] p-6 rounded-[2rem] shadow-lg w-fit mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <Gift className="text-[#002D5B] w-10 h-10" />
              </div>
              <h3 className="text-[#002D5B] font-black text-2xl uppercase mb-3">Pulseira VIP Exclusive</h3>
              <p className="text-gray-600 font-medium leading-relaxed text-lg italic">
                Acesso garantido e conforto para quem vive a experiência completa da UNINASSAU.
              </p>
            </div>

            <div id="solidariedade" className="bg-gradient-to-br from-red-50 to-white p-10 rounded-[3rem] border-2 border-[#E63946]/5 hover:border-[#E63946]/30 transition-all group overflow-hidden relative">
              <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity text-red-600">
                <Heart size={200} />
              </div>
              <div className="bg-[#E63946] p-6 rounded-[2rem] shadow-lg w-fit mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                <Heart className="text-white w-10 h-10" />
              </div>
              <h3 className="text-[#002D5B] font-black text-2xl uppercase mb-3">Ingresso Solidário</h3>
              <p className="text-gray-600 font-medium leading-relaxed text-lg italic">
                Sua entrada é confirmada mediante a doação de <strong className="text-[#E63946]">1kg de alimento</strong>. Vamos juntos fazer a diferença na folia!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section id="programacao" className="py-24 px-4 md:px-12 bg-[#F8F9FA] relative">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-[var(--primary-color)] text-3xl font-black uppercase tracking-widest relative">
              Programação Oficial
              <span className="block h-1.5 w-full bg-[var(--secondary-color)] rounded-full mt-2"></span>
            </h2>
          </div>

          <div className="space-y-6">
            {attractions.length === 0 ? (
              <div className="text-center py-20 bg-[#002D5B]/5 rounded-[3rem] border-4 border-dashed border-[#002D5B]/10 animate-pulse">
                <Music className="w-16 h-16 text-[#002D5B]/10 mx-auto mb-4" />
                <p className="text-2xl font-black text-[#002D5B] opacity-20 uppercase tracking-[0.3em]">Programação a ser definida</p>
              </div>
            ) : (
              attractions.map((item, idx) => (
                <div key={idx} className={`group flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2rem] transition-all border-2 ${item.is_featured
                  ? 'bg-[#002D5B] text-white shadow-2xl scale-[1.03] ring-4 ring-[#FFD100]/20 border-[#FFD100]/50'
                  : 'bg-white text-[#002D5B] shadow-md hover:shadow-xl hover:-translate-y-1 border-transparent hover:border-[#FFD100]'
                  }`}>
                  <div className="flex items-center gap-6 mb-4 md:mb-0">
                    <div className={`p-4 rounded-2xl ${item.is_featured ? 'bg-white/10' : 'bg-[#FFD100]/10 text-[#FFD100]'}`}>
                      {item.type === 'dj' ? <Clock size={20} /> : <Music size={20} />}
                    </div>
                    <span className="text-2xl font-black tracking-tighter">{item.time}</span>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className={`text-xl md:text-2xl font-black uppercase tracking-tight ${item.is_featured ? 'text-[#FFD100]' : ''}`}>
                      {item.name}
                    </span>
                    {item.is_featured && <Star size={24} className="text-[#FFD100] fill-[#FFD100] animate-pulse" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-gradient-to-b from-[#002D5B] to-[#001a35] text-white pt-16 pb-6">
        <div className="px-4 md:px-12 pb-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

            {/* Left Column - Description */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-[#FFD100] font-black text-xs uppercase tracking-[0.3em] mb-2">Sobre o Evento</h3>
              <p className="text-base text-blue-100/80 leading-relaxed font-light">
                Aprendizado que forma líderes, transforma histórias e faz o futuro desfilar com conhecimento, inovação e a energia vibrante do Carnaval da UNINASSAU.
              </p>
            </div>

            {/* Center Column - Location */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-[#FFD100] font-black text-xs uppercase tracking-[0.3em] mb-2">Localização Estratégica</h3>
              <div className="flex items-start gap-3 text-blue-100/90">
                <MapPin size={20} className="text-[#FFD100] mt-1 flex-shrink-0" />
                <p className="text-sm font-medium leading-relaxed">
                  R. Fernando Lopes, 752 - Graças<br />
                  Recife - PE, 52011-220
                </p>
              </div>

              {/* Social Media */}
              <div className="pt-4">
                <a
                  href="https://www.instagram.com/uninassau/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-[#FFD100] text-white hover:text-[#002D5B] px-4 py-2.5 rounded-xl transition-all group"
                >
                  <Instagram size={18} />
                  <span className="text-sm font-bold">@uninassau</span>
                </a>
              </div>
            </div>

            {/* Right Column - Contact */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-[#FFD100] font-black text-xs uppercase tracking-[0.3em] mb-2">Contato Oficial</h3>
              <a
                href="tel:+558134134611"
                className="text-2xl font-black text-white hover:text-[#FFD100] transition-colors"
              >
                (81) 3413-4611
              </a>
              <p className="text-xs text-blue-100/50 uppercase tracking-widest">Atendimento: Seg - Sex, 8h às 18h</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 px-4 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-blue-200/40 uppercase tracking-[0.4em] font-bold text-center md:text-left">
              © 2026 UNINASSAU | Compromisso com a Educação e Cultura
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FFD100] animate-pulse"></div>
              <span className="text-[9px] text-blue-200/30 uppercase tracking-widest font-semibold">Bloco dos Mauricinhos - Ano IV</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
