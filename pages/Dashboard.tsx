
import React, { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';
import {
  Users,
  Ticket,
  ShoppingBasket,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Music,
  User as UserIcon,
  Loader2,
  Search,
  PackageCheck,
  AlertCircle,
  CalendarRange,
  ClipboardList,
  ArrowRight,
  X,
  Trash2,
  Plus,
  Calendar,
  Star,
  Pencil,
  Settings,
  Image as ImageIcon,
  Palette,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie, LabelList } from 'recharts';
import { supabase, Participant, Attraction, EventSettings } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'collection' | 'schedule' | 'settings'>('overview');
  const [eventSettings, setEventSettings] = useState<EventSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [newAttraction, setNewAttraction] = useState({ name: '', time: '', type: 'banda', is_featured: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [attractionLoading, setAttractionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [selectedFood, setSelectedFood] = useState<string>('');
  const [customFood, setCustomFood] = useState<string>('');
  const [foodWeight, setFoodWeight] = useState<number>(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string | null }>({ isOpen: false, id: null, name: null });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastConfirmedName, setLastConfirmedName] = useState('');

  const commonFoods = ['Arroz', 'Feijão', 'Macarrão', 'Açúcar', 'Óleo', 'Farinha', 'Leite em pó', 'Café', 'Outros'];
  const itemsPerPage = 10;

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const safeData = Array.isArray(data) ? data : [];
      console.log("Fetched Participants:", safeData.length);
      setParticipants(safeData);
    } catch (err) {
      console.error('Erro ao buscar participantes:', err);
      setError('Erro ao carregar dados dos participantes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttractions = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('attractions')
        .select('*')
        .order('time', { ascending: true });
      if (fetchError) throw fetchError;
      setAttractions(data || []);
    } catch (err) {
      console.error('Erro ao buscar atrações:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('event_settings')
        .select('*')
        .eq('id', 'current_event')
        .single();
      if (fetchError) throw fetchError;
      setEventSettings(data);
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchParticipants(),
      fetchAttractions(),
      fetchSettings()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    // Check initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) throw authError;

        const isAuth = !!session;
        console.log("Auth Init:", isAuth ? "Logged In" : "Not Logged In");
        setIsAuthenticated(isAuth);

        if (isAuth) {
          await refreshAllData();
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const isAuth = !!session;
      console.log("Auth Change Event:", _event, isAuth ? "Logged In" : "Logged Out");
      setIsAuthenticated(isAuth);
      if (isAuth) {
        refreshAllData();
      } else {
        setParticipants([]);
        setAttractions([]);
        setEventSettings(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('participants_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => fetchParticipants()
      )
      .subscribe();

    const attrChannel = supabase
      .channel('attractions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attractions' },
        () => fetchAttractions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(attrChannel);
    };
  }, [isAuthenticated]);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      // onAuthStateChange handles setIsAuthenticated
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#001a35] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFD100]/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E63946]/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

          {/* Confetti-like decor */}
          <div className="absolute top-20 right-[15%] text-[#FFD100]/20 rotate-12 animate-float"><Music size={40} /></div>
          <div className="absolute bottom-40 left-[10%] text-[#E63946]/20 -rotate-12 animate-float-delayed"><Star size={30} /></div>
          <div className="absolute top-1/2 left-[5%] text-[#2A9D8F]/20 animate-bounce"><Users size={24} /></div>
        </div>

        <div className="w-full max-w-[480px] z-10 animate-modal-enter">
          <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] p-12 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">

            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-[#FFD100] to-[#FFA500] rounded-[2.5rem] shadow-[0_20px_40px_-8px_rgba(255,209,0,0.3)] mb-8 transform hover:scale-105 transition-transform duration-500">
                <Logo className="h-10" />
              </div>
              <h1 className="text-white text-3xl font-black uppercase tracking-widest mb-3">Área do Gestor</h1>
              <p className="text-blue-100/40 font-bold uppercase text-[10px] tracking-[0.4em]">Autenticação Obrigatória • v4.0</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-white/40 text-[9px] font-black uppercase ml-5 tracking-widest">E-mail Administrativo</label>
                  <div className="relative group">
                    <UserIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFD100] transition-colors" />
                    <input
                      type="email"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-5 text-white font-bold focus:outline-none focus:border-[#FFD100]/50 focus:bg-white/[0.08] transition-all placeholder:text-white/10"
                      placeholder="admin@uninassau.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/40 text-[9px] font-black uppercase ml-5 tracking-widest">Senha Secreta</label>
                  <div className="relative group">
                    <AlertCircle size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFD100] transition-colors" />
                    <input
                      type="password"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-5 text-white font-bold focus:outline-none focus:border-[#FFD100]/50 focus:bg-white/[0.08] transition-all placeholder:text-white/10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {authError && (
                <div className="bg-[#E63946]/10 border border-[#E63946]/20 p-4 rounded-2xl animate-shake">
                  <p className="text-[#E63946] text-[10px] font-black uppercase text-center leading-relaxed">
                    Acesso Negado 🛑 <br />
                    <span className="opacity-60 font-bold mt-1 block">{authError === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : authError}</span>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#FFD100] hover:bg-[#ffe04d] text-[#002D5B] py-6 rounded-2xl font-black uppercase tracking-widest shadow-[0_12px_24px_-8px_rgba(255,209,0,0.4)] hover:-translate-y-1 active:scale-95 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {authLoading ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    Validar Acesso
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-12 text-center pt-8 border-t border-white/5">
              <Link to="/" className="text-white/30 hover:text-[#FFD100] transition-colors text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                ← Sair da área restrita
              </Link>
            </div>
          </div>

          <p className="text-center mt-8 text-white/20 text-[8px] font-bold uppercase tracking-[0.5em]">
            Segurança Criptografada via Supabase SSL
          </p>
        </div>
      </div>
    );
  }



  const handleAddAttraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttraction.name || !newAttraction.time) {
      alert('Por favor, preencha o nome e o horário da atração! 🎸');
      return;
    }

    setAttractionLoading(true);
    try {
      if (editingId) {
        const { error: updError } = await supabase
          .from('attractions')
          .update(newAttraction)
          .eq('id', editingId);
        if (updError) throw updError;
        alert('Atração atualizada com sucesso! ✨');
      } else {
        const { error: insError } = await supabase
          .from('attractions')
          .insert([newAttraction]);
        if (insError) throw insError;
        alert('Atração adicionada na grade! 🥁');
      }
      setNewAttraction({ name: '', time: '', type: 'banda', is_featured: false });
      setEditingId(null);
      fetchAttractions(); // Fetch immediately for better UX
    } catch (err) {
      console.error('Erro ao salvar atração:', err);
      alert('Erro ao salvar atração. Tente novamente.');
    } finally {
      setAttractionLoading(false);
    }
  };

  const handleEditClick = (attr: Attraction) => {
    setNewAttraction({
      name: attr.name,
      time: attr.time,
      type: attr.type,
      is_featured: !!attr.is_featured
    });
    setEditingId(attr.id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventSettings) return;
    setSettingsLoading(true);
    try {
      const { error: updError } = await supabase
        .from('event_settings')
        .update({
          edition: eventSettings.edition,
          year_label: eventSettings.year_label,
          hero_image_url: eventSettings.hero_image_url,
          event_date: eventSettings.event_date,
          subtitle: eventSettings.subtitle,
          about_text: eventSettings.about_text,
          primary_color: eventSettings.primary_color,
          secondary_color: eventSettings.secondary_color,
          accent_color: eventSettings.accent_color,
          title_main_color: eventSettings.title_main_color,
          title_highlight_color: eventSettings.title_highlight_color,
          title_main: eventSettings.title_main,
          title_highlight: eventSettings.title_highlight,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'current_event');
      if (updError) throw updError;
      alert('Configurações atualizadas com sucesso! ✨');
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err);
      alert('Erro ao salvar as configurações.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventSettings) return;

    setImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-assets')
        .getPublicUrl(filePath);

      setEventSettings({ ...eventSettings, hero_image_url: publicUrl });
    } catch (err) {
      console.error('Erro no upload:', err);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteAttraction = async () => {
    if (!deleteModal.id) return;
    try {
      const { error: delError } = await supabase
        .from('attractions')
        .delete()
        .eq('id', deleteModal.id);
      if (delError) throw delError;
      setDeleteModal({ isOpen: false, id: null, name: null });
      fetchAttractions(); // Fetch immediately for better UX
    } catch (err) {
      console.error('Erro ao deletar atração:', err);
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!confirm('Tem certeza que deseja excluir este folião permanentemente?')) return;

    try {
      const { error: delError } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantId);

      if (delError) throw delError;

      setIsDetailModalOpen(false);
      setSelectedParticipant(null);
      // fetchParticipants() will be triggered by realtime channel or we can call it here
      await fetchParticipants();
    } catch (err: any) {
      console.error('Erro ao deletar folião:', err);
      alert(`Erro ao excluir folião: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleConfirmDelivery = async (participantId: string, kg: number, foodType: string) => {
    setUpdateLoading(participantId);
    try {
      const { error: updateError } = await supabase
        .from('participants')
        .update({
          status: 'entregue',
          bracelet_delivered: true,
          delivery_at: new Date().toISOString(),
          food_kg: kg,
          food_type: foodType,
          notes: `Retirada de pulseira: ${foodType} (${kg}kg)`
        })
        .eq('id', participantId);

      if (updateError) throw updateError;

      setLastConfirmedName(selectedParticipant.name);
      setIsModalOpen(false);
      setSelectedParticipant(null);
      setSelectedFood('');
      setCustomFood('');
      setFoodWeight(1);

      // Force refresh data
      await fetchParticipants();
      setShowSuccessModal(true);

      // Small vibration effect if supported
      if ('vibrate' in navigator) navigator.vibrate(100);
    } catch (err) {
      console.error('Erro ao atualizar entrega:', err);
      alert('Erro ao confirmar entrega. Tente novamente.');
    } finally {
      setUpdateLoading(null);
    }
  };

  // Calculate statistics safely
  const totalInscritos = Array.isArray(participants) ? participants.length : 0;
  const totalEntregues = Array.isArray(participants) ? participants.filter(p => p?.bracelet_delivered).length : 0;
  const totalPendentes = totalInscritos - totalEntregues;
  const totalFoodKg = Array.isArray(participants) ? participants.reduce((acc, p) => acc + (p?.food_kg || 0), 0) : 0;

  const today = new Date().toISOString().split('T')[0];
  const entreguesHoje = Array.isArray(participants) ? participants.filter(p =>
    p?.bracelet_delivered && p?.delivery_at && typeof p.delivery_at === 'string' && p.delivery_at.startsWith(today)
  ).length : 0;

  const unitCounts = Array.isArray(participants) ? participants.reduce((acc, p) => {
    const unit = p?.unit || 'Não Informada';
    acc[unit] = (acc[unit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) : {};

  const barData = Object.entries(unitCounts).map(([name, value], index) => ({
    name,
    value,
    color: ['#002D5B', '#1D71BC', '#FFD100', '#2A9D8F', '#E63946'][index % 5]
  }));

  const foodTypeCounts = Array.isArray(participants) ? participants.reduce((acc, p) => {
    if (p?.bracelet_delivered && p?.food_type) {
      acc[p.food_type] = (acc[p.food_type] || 0) + (p.food_kg || 0);
    }
    return acc;
  }, {} as Record<string, number>) : {};

  const foodPieData = Object.entries(foodTypeCounts).map(([name, value], index) => ({
    name,
    value,
    color: ['#FFD100', '#002D5B', '#E63946', '#2A9D8F', '#1D71BC', '#F97316', '#8E44AD'][index % 7]
  }));

  const userTypeCounts = Array.isArray(participants) ? participants.reduce((acc, p) => {
    const type = p?.user_type || 'Aluno(a)';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) : {};

  const userTypePieData = Object.entries(userTypeCounts).map(([name, value], index) => ({
    name,
    value,
    color: ['#002D5B', '#FFD100', '#E63946', '#2A9D8F', '#1D71BC'][index % 5]
  }));

  const filteredParticipants = participants.filter(p => {
    const q = searchQuery.toLowerCase();
    const name = (p?.name || '').toLowerCase();
    const cpf = p?.cpf || '';
    const email = (p?.email || '').toLowerCase();

    return name.includes(q) || cpf.includes(q) || email.includes(q);
  });

  console.log("Dashboard State:", { isAuthenticated, loading, participantsCount: participants?.length, hasError: !!error });

  const totalPages = Math.ceil(filteredParticipants.length / Math.max(1, itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParticipants = filteredParticipants.slice(startIndex, startIndex + itemsPerPage);

  // If we are loading for the first time or have a critical error
  if (loading && participants.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-[#002D5B] flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-[#FFD100]/20 border-t-[#FFD100] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Logo className="h-6 animate-pulse" />
          </div>
        </div>
        <p className="mt-8 text-white/50 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando Dados...</p>
      </div>
    );
  }

  if (error && participants.length === 0) {
    return (
      <div className="min-h-screen bg-[#002D5B] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-500/10 p-6 rounded-[2rem] border-2 border-red-500/20 max-w-sm">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-xl font-black uppercase tracking-widest mb-2">Erro de Conexão</h2>
          <p className="text-white/60 text-sm font-bold mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-white text-[#002D5B] py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#FFD100] transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans text-[#002D5B] bg-carnival-pattern">
      <header className="bg-[#002D5B] px-8 py-4 flex items-center justify-between shadow-xl border-b-4 border-[#FFD100] sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo className="h-10" />
          <h1 className="text-white text-sm font-black uppercase tracking-[0.2em] hidden md:block border-l-2 border-white/20 pl-6">
            Painel Administrativo <span className="text-[#FFD100]">/ Ano IV</span>
          </h1>
        </div>

        <div className="flex items-center space-x-8">
          <div className="hidden sm:flex items-center space-x-4 text-white">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold opacity-50 tracking-widest leading-none">Acesso</p>
              <p className="text-xs font-black">Administrador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-[#E63946] text-white text-[10px] font-black px-6 py-2.5 rounded-xl hover:bg-white hover:text-[#E63946] transition-all flex items-center space-x-3 shadow-lg group uppercase tracking-widest"
          >
            <span>Sair</span>
            <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 space-y-10 max-w-[1600px] mx-auto w-full relative z-10">
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center bg-white/40 p-1.5 rounded-[2rem] border-2 border-white/80 backdrop-blur-md shadow-lg">
            {[
              { id: 'overview', label: 'Visão Geral' },
              { id: 'collection', label: 'Ponto de Coleta' },
              { id: 'schedule', label: 'Programação' },
              { id: 'settings', label: 'Configurações' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#002D5B] text-white shadow-xl scale-105' : 'text-[#002D5B]/60 hover:bg-white/50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* KPIs... mantendo os existentes */}
              <div className="glass-card p-6 rounded-[2.5rem] shadow-2xl border-b-8 border-[#FFD100] group hover:-translate-y-2 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Users size={100} /></div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-[#FFD100] p-4 rounded-2xl shadow-lg"><Users className="text-[#002D5B]" size={28} /></div>
                  <div>
                    <p className="text-[#002D5B] text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total de Inscritos</p>
                    <h3 className="text-[#002D5B] text-3xl font-black tracking-tighter">{loading ? '...' : totalInscritos.toLocaleString('pt-BR')}</h3>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-[2.5rem] shadow-2xl border-b-8 border-[#2A9D8F] group hover:-translate-y-2 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Ticket size={100} /></div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-[#2A9D8F] p-4 rounded-2xl shadow-lg"><Ticket className="text-white" size={28} /></div>
                  <div>
                    <p className="text-[#002D5B] text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Pulseiras Entregues</p>
                    <h3 className="text-[#002D5B] text-3xl font-black tracking-tighter">{loading ? '...' : totalEntregues.toLocaleString('pt-BR')}</h3>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-[2.5rem] shadow-2xl border-b-8 border-[#1D71BC] group hover:-translate-y-2 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><ShoppingBasket size={100} /></div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-[#1D71BC] p-4 rounded-2xl shadow-lg"><ShoppingBasket className="text-white" size={28} /></div>
                  <div>
                    <p className="text-[#002D5B] text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Alimentos (KG)</p>
                    <h3 className="text-[#002D5B] text-3xl font-black tracking-tighter">{loading ? '...' : totalFoodKg.toLocaleString('pt-BR')}kg</h3>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-[2.5rem] shadow-2xl border-b-8 border-[#E63946] group hover:-translate-y-2 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><CheckCircle2 size={100} /></div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-[#E63946] p-4 rounded-2xl shadow-lg"><CheckCircle2 className="text-white" size={28} /></div>
                  <div>
                    <p className="text-[#002D5B] text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Entregas Hoje</p>
                    <h3 className="text-[#002D5B] text-3xl font-black tracking-tighter">{loading ? '...' : entreguesHoje.toLocaleString('pt-BR')}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-white/50 flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <h4 className="text-[#002D5B] font-black uppercase tracking-widest text-xs">Arrecadação por Tipo de Alimento (KG)</h4>
                  <div className="bg-[#1D71BC] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Total: {totalFoodKg}kg</div>
                </div>
                <div className="h-[400px] w-full">
                  {foodPieData && foodPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={foodPieData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#002D5B', fontSize: 10, fontWeight: 800 }} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: '#002D5B', fillOpacity: 0.05 }}
                          formatter={(value: any) => [value, ""]}
                        />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                          {foodPieData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                          <LabelList
                            dataKey="value"
                            position="top"
                            formatter={(v: number) => `${v}kg`}
                            style={{ fill: '#002D5B', fontSize: 12, fontWeight: 900 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300">
                      <ShoppingBasket size={48} className="mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Aguardando Coletas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-white/50 flex flex-col">
                <h4 className="text-[#002D5B] text-center font-black uppercase tracking-widest text-xs mb-10">Desempenho por Unidade</h4>
                <div className="h-[300px] w-full">
                  {barData && barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 40, left: 40, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#002D5B', fontSize: 10, fontWeight: 800 }} width={100} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: '#002D5B', fillOpacity: 0.05 }}
                          formatter={(value: any) => [value, ""]}
                        />
                        <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={30}>
                          {barData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                          <LabelList
                            dataKey="value"
                            position="right"
                            style={{ fill: '#002D5B', fontSize: 12, fontWeight: 900 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300">
                      <ClipboardList size={48} className="mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Sem dados para exibir</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-white/50 flex flex-col">
                <h4 className="text-[#002D5B] text-center font-black uppercase tracking-widest text-xs mb-10">Perfil do Público</h4>
                <div className="flex-1 min-h-[300px] relative">
                  {userTypePieData && userTypePieData.length > 0 ? (
                    <>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={userTypePieData}
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={8}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {userTypePieData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: any) => [value, ""]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-center">
                        <div>
                          <p className="text-[10px] font-black uppercase opacity-40">Total</p>
                          <p className="text-2xl font-black text-[#002D5B]">{totalInscritos}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10">
                      <Users size={48} className="mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Aguardando Inscrições</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {
          activeTab === 'collection' && (
            <div className="glass-card p-8 rounded-[3rem] shadow-2xl border-4 border-[#FFD100]/30 animate-fade-in bg-white/40">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#002D5B] opacity-30" size={24} />
                  <input
                    type="text"
                    placeholder="Buscar folião por Nome, CPF ou E-mail..."
                    className="w-full bg-white border-2 border-[#002D5B]/5 rounded-3xl py-6 pl-16 pr-8 focus:border-[#FFD100] focus:outline-none shadow-xl font-bold placeholder:opacity-30 transition-all text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-[2rem] border-2 border-[#002D5B]/5 bg-white/80">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#002D5B] text-white">
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest rounded-tl-[2rem]">Folião</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">CPF</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">Unidade</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-center rounded-tr-[2rem]">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin inline-block text-[#FFD100]" /></td></tr>
                    ) : paginatedParticipants.map((p, index) => (
                      <tr key={p.id || index} className="group hover:bg-[#FFD100]/5 transition-colors border-b border-[#002D5B]/5 last:border-0">
                        <td className="px-10 py-6"><p className="font-extrabold text-[#002D5B]">{p.name}</p></td>
                        <td className="px-6 py-6 text-center font-mono text-xs text-[#002D5B]/60 font-bold">{p.cpf}</td>
                        <td className="px-6 py-6 text-center"><span className="bg-[#002D5B]/5 text-[#002D5B] px-4 py-1 rounded-lg text-[10px] font-black uppercase">{p.unit}</span></td>
                        <td className="px-6 py-6 text-center">
                          {p.bracelet_delivered ? (
                            <div className="inline-flex items-center gap-2 bg-[#2A9D8F]/10 text-[#2A9D8F] px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-[#2A9D8F]/20"><CheckCircle2 size={12} /> Entregue</div>
                          ) : (
                            <div className="inline-flex items-center gap-2 bg-[#FFD100]/10 text-[#002D5B] px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-[#FFD100]/40"><Clock size={12} /> Pendente</div>
                          )}
                        </td>
                        <td className="px-10 py-6 text-center">
                          {!p.bracelet_delivered ? (
                            <button onClick={() => { setSelectedParticipant(p); setIsModalOpen(true); }} className="bg-[#2A9D8F] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all">Confirmar Entrega</button>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <div className="text-[10px] font-bold text-[#2A9D8F] flex flex-col items-center">
                                <span className="opacity-50 uppercase text-[8px]">Entregue em:</span>
                                <span>{new Date(p.delivery_at!).toLocaleDateString('pt-BR')} {new Date(p.delivery_at!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <button onClick={() => { setSelectedParticipant(p); setIsDetailModalOpen(true); }} className="text-[9px] font-black uppercase text-[#1D71BC] hover:underline transition-all">Ver Detalhes</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        {
          activeTab === 'schedule' && (
            <div className="animate-fade-in space-y-8">
              <div className="glass-card p-10 rounded-[3rem] shadow-2xl border-4 border-[#1D71BC]/30">
                <h3 className="text-xl font-black text-[#002D5B] uppercase tracking-widest mb-8 flex items-center gap-4">
                  <div className={`${editingId ? 'bg-orange-500' : 'bg-[#1D71BC]'} p-3 rounded-2xl text-white transition-colors`}><Calendar size={24} /></div>
                  {editingId ? 'Editar Atração' : 'Nova Atração'}
                </h3>
                <form onSubmit={handleAddAttraction} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-[#002D5B]/50 ml-1 tracking-widest">Nome da Atração</label>
                    <input type="text" placeholder="Ex: Banda de Frevo" className="w-full bg-[#002D5B]/5 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#1D71BC] focus:bg-white focus:outline-none transition-all font-bold" value={newAttraction.name} onChange={e => setNewAttraction({ ...newAttraction, name: e.target.value })} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-[#002D5B]/50 ml-1 tracking-widest">Horário</label>
                    <input type="time" className="w-full bg-[#002D5B]/5 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#1D71BC] focus:bg-white focus:outline-none transition-all font-bold" value={newAttraction.time} onChange={e => setNewAttraction({ ...newAttraction, time: e.target.value })} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-[#002D5B]/50 ml-1 tracking-widest">Tipo</label>
                    <select className="w-full bg-[#002D5B]/5 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#1D71BC] focus:bg-white focus:outline-none transition-all font-bold" value={newAttraction.type} onChange={e => setNewAttraction({ ...newAttraction, type: e.target.value })}>
                      <option value="banda">Banda / Show</option>
                      <option value="dj">DJ Set</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-2 border-[#1D71BC] text-[#1D71BC] focus:ring-[#1D71BC]"
                        checked={newAttraction.is_featured}
                        onChange={e => setNewAttraction({ ...newAttraction, is_featured: e.target.checked })}
                      />
                      <span className="text-[10px] font-black uppercase text-[#002D5B] group-hover:text-[#1D71BC] transition-colors">Destaque Principal ★</span>
                    </label>
                    <div className="flex gap-4">
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => { setEditingId(null); setNewAttraction({ name: '', time: '', type: 'banda', is_featured: false }); }}
                          className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all font-sans"
                        >
                          Cancelar
                        </button>
                      )}
                      <button type="submit" disabled={attractionLoading} className={`${editingId ? 'bg-orange-500' : 'bg-[#1D71BC]'} text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-tighter shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 flex-[2]`}>
                        {attractionLoading ? <Loader2 size={16} className="animate-spin" /> : (editingId ? <Pencil size={16} /> : <Plus size={16} />)}
                        {editingId ? 'Salvar Alterações' : 'Adicionar na Grade'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="glass-card p-10 rounded-[3rem] shadow-2xl border-4 border-white/50 min-h-[400px]">
                <h3 className="text-xl font-black text-[#002D5B] uppercase tracking-widest mb-10 text-center">Programação Oficial</h3>

                <div className="space-y-6 max-w-3xl mx-auto">
                  {attractions.length === 0 ? (
                    <div className="text-center py-20 bg-[#002D5B]/5 rounded-[3rem] border-4 border-dashed border-[#002D5B]/10 animate-pulse">
                      <Music className="w-16 h-16 text-[#002D5B]/10 mx-auto mb-4" />
                      <p className="text-2xl font-black text-[#002D5B] opacity-20 uppercase tracking-[0.3em]">Programação a ser definida</p>
                    </div>
                  ) : (
                    attractions.map((attr, index) => (
                      <div key={attr.id} className={`group relative bg-white rounded-3xl p-6 shadow-xl border-2 transition-all hover:scale-[1.02] flex items-center justify-between ${attr.is_featured ? 'border-[#FFD100] bg-[#FFD100]/5 ring-4 ring-[#FFD100]/10' : 'border-white hover:border-[#FFD100]'}`}>
                        <div className="flex items-center gap-8">
                          <div className={`px-6 py-3 rounded-2xl font-black text-xl shadow-lg ring-4 ${attr.is_featured ? 'bg-[#002D5B] text-white ring-[#002D5B]/20' : 'bg-[#FFD100] text-[#002D5B] ring-[#FFD100]/20'}`}>{attr.time}</div>
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="font-black text-[#002D5B] text-2xl uppercase tracking-tighter">{attr.name}</p>
                              {attr.is_featured && <Star size={20} className="text-[#FFD100] fill-[#FFD100]" />}
                            </div>
                            <p className="text-[10px] font-extrabold uppercase text-[#002D5B]/40 tracking-widest">{attr.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleEditClick(attr)} className="p-4 bg-blue-50 text-blue-400 rounded-2xl hover:bg-blue-500 hover:text-white transition-all md:opacity-40 group-hover:opacity-100" title="Editar Atração"><Pencil size={20} /></button>
                          <button onClick={() => setDeleteModal({ isOpen: true, id: attr.id || null, name: attr.name })} className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all md:opacity-40 group-hover:opacity-100" title="Excluir Atração"><Trash2 size={20} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        }
        {
          activeTab === 'settings' && eventSettings && (
            <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
              <div className="glass-card p-10 rounded-[3rem] shadow-2xl border-4 border-[#002D5B]/10">
                <h3 className="text-xl font-black text-[#002D5B] uppercase tracking-widest mb-10 flex items-center gap-4">
                  <div className="bg-[#002D5B] p-3 rounded-2xl text-white"><Settings size={28} /></div>
                  Identidade do Evento
                </h3>

                <form onSubmit={handleUpdateSettings} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-[#002D5B]/50 ml-1 tracking-widest">Edição do Evento</label>
                      <input
                        type="text"
                        className="w-full bg-[#002D5B]/5 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#002D5B] focus:bg-white focus:outline-none transition-all font-bold"
                        value={eventSettings.edition}
                        onChange={e => setEventSettings({ ...eventSettings, edition: e.target.value })}
                        placeholder="Ex: 4ª Edição"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-[#002D5B]/50 ml-1 tracking-widest">Selo de Ano (Header)</label>
                      <input
                        type="text"
                        className="w-full bg-[#002D5B]/5 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#002D5B] focus:bg-white focus:outline-none transition-all font-bold"
                        value={eventSettings.year_label}
                        onChange={e => setEventSettings({ ...eventSettings, year_label: e.target.value })}
                        placeholder="Ex: Ano IV"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-[#002D5B]/50 ml-1 tracking-widest">Data Oficial</label>
                      <input
                        type="text"
                        className="w-full bg-[#002D5B]/5 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#002D5B] focus:bg-white focus:outline-none transition-all font-bold"
                        value={eventSettings.event_date}
                        onChange={e => setEventSettings({ ...eventSettings, event_date: e.target.value })}
                        placeholder="Ex: 27 de Fevereiro"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-[#002D5B]/50 ml-1 tracking-widest">Subtítulo (Abaixo do Título)</label>
                      <input
                        type="text"
                        className="w-full bg-[#002D5B]/5 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#002D5B] focus:bg-white focus:outline-none transition-all font-bold"
                        value={eventSettings.subtitle || ''}
                        onChange={e => setEventSettings({ ...eventSettings, subtitle: e.target.value })}
                        placeholder="Frase curta de impacto..."
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-[#002D5B]/50 ml-1 tracking-widest">Texto do Título (Linha 1)</label>
                      <input
                        type="text"
                        className="w-full bg-[#002D5B]/5 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#002D5B] focus:bg-white focus:outline-none transition-all font-bold"
                        value={eventSettings.title_main || ''}
                        onChange={e => setEventSettings({ ...eventSettings, title_main: e.target.value })}
                        placeholder="Ex: Bloco dos"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-[#002D5B]/50 ml-1 tracking-widest">Texto do Título (Destaque)</label>
                      <input
                        type="text"
                        className="w-full bg-[#002D5B]/5 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#002D5B] focus:bg-white focus:outline-none transition-all font-bold"
                        value={eventSettings.title_highlight || ''}
                        onChange={e => setEventSettings({ ...eventSettings, title_highlight: e.target.value })}
                        placeholder="Ex: Mauricinhos"
                      />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] font-black uppercase text-[#002D5B]/50 ml-1 tracking-widest">Texto "Sobre o Evento" (Footer)</label>
                      <textarea
                        rows={3}
                        className="w-full bg-[#002D5B]/5 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#002D5B] focus:bg-white focus:outline-none transition-all font-bold resize-none"
                        value={eventSettings.about_text || ''}
                        onChange={e => setEventSettings({ ...eventSettings, about_text: e.target.value })}
                        placeholder="Descrição detalhada para o rodapé..."
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-[#002D5B]/50 ml-1 tracking-widest">Imagem Hero (Banner)</label>
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-4 items-center">
                          <div className="flex-1 relative group cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              disabled={imageUploading}
                            />
                            <div className={`w-full bg-[#002D5B]/5 border-2 border-dashed rounded-2xl px-6 py-6 transition-all flex items-center justify-center gap-3 ${imageUploading ? 'border-[#002D5B]/20 animate-pulse' : 'border-[#002D5B]/20 group-hover:border-[#002D5B] group-hover:bg-[#002D5B]/5'}`}>
                              {imageUploading ? (
                                <>
                                  <Loader2 className="animate-spin text-[#002D5B]" size={20} />
                                  <span className="text-[10px] font-black uppercase text-[#002D5B]">Enviando...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="text-[#002D5B]" size={20} />
                                  <span className="text-[10px] font-black uppercase text-[#002D5B]">Escolher Nova Foto Hero</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                            <img
                              src={eventSettings.hero_image_url}
                              className="w-full h-full object-cover"
                              alt="Preview"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/hero-carnaval.jpg';
                              }}
                            />
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest px-2">* Recomendado: 1920x1080px</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-[#002D5B]/30 border-b border-[#002D5B]/5 pb-2 flex items-center gap-2">
                      <Palette size={14} /> Cores da Marca
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-[#002D5B]/60 ml-1">Cor Primária (Azul)</label>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-[#002D5B]/5 shadow-sm">
                          <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-none" value={eventSettings.primary_color} onChange={e => setEventSettings({ ...eventSettings, primary_color: e.target.value })} />
                          <span className="font-mono text-xs font-bold uppercase">{eventSettings.primary_color}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-[#002D5B]/60 ml-1">Cor Secundária (Amarelo)</label>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-[#002D5B]/5 shadow-sm">
                          <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-none" value={eventSettings.secondary_color} onChange={e => setEventSettings({ ...eventSettings, secondary_color: e.target.value })} />
                          <span className="font-mono text-xs font-bold uppercase">{eventSettings.secondary_color}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-[#002D5B]/60 ml-1">Cor de Destaque (Vermelho)</label>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-[#002D5B]/5 shadow-sm">
                          <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-none" value={eventSettings.accent_color} onChange={e => setEventSettings({ ...eventSettings, accent_color: e.target.value })} />
                          <span className="font-mono text-xs font-bold uppercase">{eventSettings.accent_color}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-[#002D5B]/30 border-b border-[#002D5B]/5 pb-2 flex items-center gap-2">
                      <Palette size={14} /> Cores do Título Hero
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-[#002D5B]/60 ml-1">Parte de Cima (Ex: Bloco dos)</label>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-[#002D5B]/5 shadow-sm">
                          <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-none" value={eventSettings.title_main_color || '#FFFFFF'} onChange={e => setEventSettings({ ...eventSettings, title_main_color: e.target.value })} />
                          <span className="font-mono text-xs font-bold uppercase">{eventSettings.title_main_color || '#FFFFFF'}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-[#002D5B]/60 ml-1">Parte de Baixo (Ex: Mauricinhos)</label>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-[#002D5B]/5 shadow-sm">
                          <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-none" value={eventSettings.title_highlight_color || '#FFD100'} onChange={e => setEventSettings({ ...eventSettings, title_highlight_color: e.target.value })} />
                          <span className="font-mono text-xs font-bold uppercase">{eventSettings.title_highlight_color || '#FFD100'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#002D5B]/5">
                    <button
                      disabled={settingsLoading}
                      className="w-full md:w-auto bg-[#002D5B] text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                    >
                      {settingsLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                      Salvar Identidade do Evento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
      </main >

      {/* Modal Detalhes do Participante */}
      {isDetailModalOpen && selectedParticipant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002D5B]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden border-4 border-[#1D71BC] animate-modal-enter">
            <div className="bg-[#1D71BC] p-8 text-white relative">
              <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"><X size={24} /></button>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-white/20 p-3 rounded-2xl"><UserIcon className="text-white" size={24} /></div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest">Detalhes do Folião</h2>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">Registro Completo</p>
                </div>
              </div>
            </div>
            <div className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-gray-400 text-[9px] font-black uppercase tracking-widest block mb-1">Nome Completo</label>
                  <p className="text-[#002D5B] font-black text-lg">{selectedParticipant.name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-[9px] font-black uppercase tracking-widest block mb-1">CPF</label>
                  <p className="text-[#002D5B] font-bold font-mono">{selectedParticipant.cpf}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-[9px] font-black uppercase tracking-widest block mb-1">E-mail</label>
                  <p className="text-[#002D5B] font-bold">{selectedParticipant.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-[9px] font-black uppercase tracking-widest block mb-1">Telefone</label>
                  <p className="text-[#002D5B] font-bold">{selectedParticipant.phone}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-[9px] font-black uppercase tracking-widest block mb-1">Unidade</label>
                  <p className="text-[#002D5B] font-black uppercase">{selectedParticipant.unit}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-[9px] font-black uppercase tracking-widest block mb-1">Vínculo</label>
                  <p className="text-[#002D5B] font-black uppercase">{selectedParticipant.user_type || 'Não Informado'}</p>
                </div>
              </div>

              {selectedParticipant.bracelet_delivered && (
                <div className="mt-8 pt-8 border-t-2 border-dashed border-[#1D71BC]/10">
                  <h3 className="text-[#1D71BC] text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <PackageCheck size={14} /> Dados da Entrega
                  </h3>
                  <div className="grid grid-cols-3 gap-6 bg-[#1D71BC]/5 p-6 rounded-3xl">
                    <div>
                      <label className="text-gray-400 text-[8px] font-black uppercase tracking-widest block mb-1">Alimento</label>
                      <p className="text-[#1D71BC] font-black text-sm uppercase">{selectedParticipant.food_type}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-[8px] font-black uppercase tracking-widest block mb-1">Peso</label>
                      <p className="text-[#1D71BC] font-black text-sm uppercase">{selectedParticipant.food_kg} KG</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-[8px] font-black uppercase tracking-widest block mb-1">Data/Hora</label>
                      <p className="text-[#1D71BC] font-bold text-[10px]">
                        {new Date(selectedParticipant.delivery_at!).toLocaleDateString('pt-BR')} às {new Date(selectedParticipant.delivery_at!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 flex gap-4">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex-1 bg-[#002D5B] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
                >
                  Fechar Detalhes
                </button>
                <button
                  onClick={() => handleDeleteParticipant(selectedParticipant.id!)}
                  className="flex-1 bg-red-50 text-[#E63946] border-2 border-[#E63946]/10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Excluir Registro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Coleta de Alimentos */}
      {
        isModalOpen && selectedParticipant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002D5B]/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden border-4 border-[#FFD100] animate-modal-enter">
              <div className="bg-[#002D5B] p-8 text-white relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"><X size={24} /></button>
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-[#FFD100] p-3 rounded-2xl"><ShoppingBasket className="text-[#002D5B]" size={24} /></div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-widest">Coleta de Alimentos</h2>
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">Folião: {selectedParticipant.name}</p>
                  </div>
                </div>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-4">
                  <label className="text-[#002D5B] font-black text-[10px] uppercase tracking-widest ml-1">Selecione o Alimento</label>
                  <div className="grid grid-cols-3 gap-3">
                    {commonFoods.map(food => (
                      <button key={food} onClick={() => setSelectedFood(food)} className={`py-3 px-2 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${selectedFood === food ? 'bg-[#FFD100] border-[#FFD100] text-[#002D5B] shadow-lg scale-105' : 'bg-white border-[#002D5B]/5 text-[#002D5B]/60 hover:border-[#FFD100]/30'}`}>{food}</button>
                    ))}
                  </div>
                </div>
                {selectedFood === 'Outros' && (
                  <div className="space-y-4 animate-slide-up">
                    <label className="text-[#002D5B] font-black text-[10px] uppercase tracking-widest ml-1">Especifique o Alimento</label>
                    <input type="text" placeholder="Ex: Leite condensado..." className="w-full bg-[#002D5B]/5 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#FFD100] focus:outline-none transition-all font-bold" value={customFood} onChange={(e) => setCustomFood(e.target.value)} autoFocus />
                  </div>
                )}
                <div className="space-y-4">
                  <label className="text-[#002D5B] font-black text-[10px] uppercase tracking-widest ml-1">Quantidade (KG)</label>
                  <div className="flex items-center gap-6">
                    <input type="range" min="1" max="10" step="0.5" className="flex-1 accent-[#FFD100]" value={foodWeight} onChange={(e) => setFoodWeight(parseFloat(e.target.value))} />
                    <div className="bg-[#002D5B] text-[#FFD100] px-6 py-3 rounded-2xl font-black text-lg min-w-[80px] text-center">{foodWeight}kg</div>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest text-[#002D5B]/40 hover:bg-red-50 transition-all">Cancelar</button>
                  <button disabled={!selectedFood || (selectedFood === 'Outros' && !customFood)} onClick={() => handleConfirmDelivery(selectedParticipant.id!, foodWeight, selectedFood === 'Outros' ? customFood : selectedFood)} className="flex-[2] bg-[#2A9D8F] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Confirmar e Entregar✨</button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Confirmação de Exclusão */}
      {
        deleteModal.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#002D5B]/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border-4 border-[#E63946] animate-modal-enter">
              <div className="bg-[#E63946] p-8 text-white text-center relative">
                <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
                  <Trash2 size={40} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest">Atenção!</h2>
              </div>
              <div className="p-8 text-center space-y-6">
                <p className="text-[#002D5B] font-bold text-lg leading-relaxed">
                  Você tem certeza que deseja excluir a atração <br />
                  <span className="text-[#E63946] font-black uppercase text-xl mt-2 block italic">"{deleteModal.name}"</span>?
                </p>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Essa ação não pode ser desfeita.</p>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, id: null, name: null })}
                    className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all border-2 border-transparent"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAttraction}
                    className="flex-1 bg-[#E63946] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-red-600 transition-all hover:scale-105 active:scale-95"
                  >
                    Sim, Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Modal de Sucesso Customizado ✨ */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#002D5B]/90 backdrop-blur-xl animate-fade-in">
          <div className="bg-white rounded-[4rem] w-full max-w-sm shadow-2xl overflow-hidden border-4 border-[#2A9D8F] animate-modal-enter text-center p-12 relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2A9D8F] via-[#FFD100] to-[#E63946]"></div>

            <div className="bg-[#2A9D8F] w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_-12px_rgba(42,157,143,0.4)] rotate-12">
              <CheckCircle2 size={48} className="text-white" />
            </div>

            <h2 className="text-[#002D5B] text-2xl font-black uppercase tracking-widest mb-2">Entrega Realizada!</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Confirmação v4.0</p>

            <div className="bg-[#2A9D8F]/5 p-6 rounded-[2rem] mb-8 border-2 border-dashed border-[#2A9D8F]/20">
              <p className="text-[#2A9D8F] font-black uppercase text-sm mb-1 italic">Voucher Validado</p>
              <p className="text-[#002D5B] font-bold text-lg">{lastConfirmedName}</p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#002D5B] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Sensacional! 🎊
            </button>

            {/* Animating confetti placeholder */}
            <div className="absolute top-10 right-10 text-[#FFD100] animate-bounce"><Star size={24} fill="currentColor" /></div>
            <div className="absolute bottom-20 left-10 text-[#2A9D8F] animate-float"><Music size={20} /></div>
          </div>
        </div>
      )}

      {/* Decorative Floating Patterns */}
      <div className="fixed top-24 right-8 flex flex-col space-y-12 opacity-[0.05] pointer-events-none animate-float"><Music size={60} /><Users size={60} /></div>
      <div className="fixed bottom-12 left-8 flex flex-col space-y-12 opacity-[0.05] pointer-events-none animate-float-delayed"><Ticket size={60} /><CheckCircle2 size={60} /></div>
    </div >
  );
};

export default Dashboard;
