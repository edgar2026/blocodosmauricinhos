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
              <div className="bg-[#002D5B] text-white px-6 py-2 rounded-full font-black text-sm md:text-base uppercase tracking-[0.2em] shadow-xl flex items-center gap-3">
                <Clock size={18} className="text-[#FFD100]" />
                <span>Das 18 às 22 horas</span>
              </div>

              <Link
                to="/register"
                className="group relative bg-[#002D5B] hover:bg-[#FFD100] text-white hover:text-[#002D5B] font-black py-5 px-12 rounded-[2rem] text-xl uppercase transition-all shadow-[0_20px_40px_rgba(0,45,91,0.2)] hover:scale-105 active:scale-95 overflow-hidden border-2 border-[#002D5B]"
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
              <h2 className="text-[#002D5B] text-4xl md:text-5xl font-black uppercase tracking-tight">
                {settings?.solidarity_title || 'Alegria & Solidariedade'}
              </h2>
            </div>

            <div className={`grid grid-cols-1 ${settings?.show_vip_card !== false && settings?.show_solidarity_card !== false ? 'md:grid-cols-2' : 'max-w-2xl mx-auto'} gap-10`}>
              {settings?.show_vip_card !== false && (
                <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-[3rem] border-2 border-[#002D5B]/5 hover:border-[#FFD100]/50 transition-all group overflow-hidden relative">
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Gift size={200} />
                  </div>
                  <div className="bg-[#FFD100] p-6 rounded-[2rem] shadow-lg w-fit mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <Gift className="text-[#002D5B] w-10 h-10" />
                  </div>
                  <h3 className="text-[#002D5B] font-black text-2xl uppercase mb-3">
                    {settings?.vip_box_title || 'Pulseira VIP Exclusive'}
                  </h3>
                  <p className="text-gray-600 font-medium leading-relaxed text-lg italic">
                    {settings?.vip_box_description || 'Acesso garantido e conforto para quem vive a experiência completa da UNINASSAU.'}
                  </p>
                </div>
              )}

              {settings?.show_solidarity_card !== false && (
                <div id="solidariedade" className="bg-gradient-to-br from-red-50 to-white p-10 rounded-[3rem] border-2 border-[#E63946]/5 hover:border-[#E63946]/30 transition-all group overflow-hidden relative">
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity text-red-600">
                    <Heart size={200} />
                  </div>
                  <div className="bg-[#E63946] p-6 rounded-[2rem] shadow-lg w-fit mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                    <Heart className="text-white w-10 h-10" />
                  </div>
                  <h3 className="text-[#002D5B] font-black text-2xl uppercase mb-3">Ingresso Solidário</h3>
                  <p className="text-gray-600 font-medium leading-relaxed text-lg italic">
                    {settings?.solidarity_description || (
                      <>
                        Sua entrada é confirmada mediante a doação de <strong className="text-[#E63946]">1kg de alimento</strong>. Vamos juntos fazer a diferença na folia!
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Schedule */}
      {settings?.show_schedule !== false && (
        <section id="programacao" className="py-24 px-4 md:px-12 bg-[#F8F9FA] relative">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex flex-col items-center mb-16">
              <h2 className="text-[var(--primary-color)] text-3xl font-black uppercase tracking-widest relative">
                {settings?.schedule_title || 'Programação Oficial'}
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
      )}

      {/* Footer */}
      {settings?.show_footer !== false && (
        <footer id="contato" className="bg-gradient-to-b from-[#002D5B] to-[#001a35] text-white pt-16 pb-6">
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
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-[#FFD100] text-white hover:text-[#002D5B] px-4 py-2.5 rounded-xl transition-all group"
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
