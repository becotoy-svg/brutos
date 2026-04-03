"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  CheckCircle,
  Clock,
  Scissors,
  User
} from 'lucide-react';

// --- Constants ---
const SCHEDULE = {
  slotMinutes: 30,
  start: '09:00',
  end: '19:00',
  closedWeekdays: [0] // Sunday
};

const SERVICE_DATA: Record<string, { duration: number; price: number }> = {
  "Corte Masculino": { duration: 45, price: 35 },
  "Barba": { duration: 30, price: 25 },
  "Corte Infantil": { duration: 30, price: 25 },
  "Combo Corte + Barba": { duration: 75, price: 55 }
};

// --- Helper Functions ---
function toMinutes(t: string) {
  const p = t.split(':');
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}

function fromMinutes(m: number) {
  const h = Math.floor(m / 60).toString().padStart(2, '0');
  const mi = (m % 60).toString().padStart(2, '0');
  return h + ':' + mi;
}

function isClosed(date: Date) {
  return SCHEDULE.closedWeekdays.includes(date.getDay());
}

function formatCurrency(n: number) {
  return 'R$ ' + n.toFixed(2).replace('.', ',');
}

export default function HomePage() {
  // --- State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState({
    startRef: new Date(),
    selectedDay: new Date().toISOString().slice(0, 10),
    period: 'morning' as 'morning' | 'afternoon' | 'evening',
    selectedSlot: null as string | null,
    selectedService: Object.keys(SERVICE_DATA)[0]
  });
  
  const [occupiedSlots, setOccupados] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    employee: ''
  });

  // --- Logic ---
  const fetchOccupiedSlots = useCallback(async (data: string) => {
    const configError = getSupabaseConfigError();
    if (!supabase || configError) {
      setOccupados([]);
      setStatus(configError || 'Supabase não configurado.');
      return;
    }

    setLoadingSlots(true);
    try {
      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select('hora')
        .eq('data', data);
      
      if (error) throw error;
      setOccupados(agendamentos?.map(a => a.hora) || []);
    } catch (err) {
      console.error('Erro ao buscar horários:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      fetchOccupiedSlots(modalState.selectedDay);
    }
  }, [isModalOpen, modalState.selectedDay, fetchOccupiedSlots]);

  const openModal = (service?: string) => {
    if (service) {
      setModalState(prev => ({ ...prev, selectedService: service }));
    }
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  const handleDayChange = (iso: string) => {
    setModalState(prev => ({ ...prev, selectedDay: iso, selectedSlot: null }));
  };

  const handlePeriodChange = (period: 'morning' | 'afternoon' | 'evening') => {
    setModalState(prev => ({ ...prev, period, selectedSlot: null }));
  };

  const changeWeek = (offset: number) => {
    const newRef = new Date(modalState.startRef);
    newRef.setDate(newRef.getDate() + offset);
    setModalState(prev => ({ ...prev, startRef: newRef }));
  };

  const handleBooking = async () => {
    const { name, phone, employee } = formData;
    const { selectedDay, selectedSlot, selectedService } = modalState;

    const configError = getSupabaseConfigError();
    if (!supabase || configError) {
      alert((configError || 'Supabase não configurado.') + ' Configure as variáveis de ambiente no deploy (Vercel) e tente novamente.');
      setStatus(configError || 'Supabase não configurado.');
      return;
    }

    if (!name || !phone) {
      setStatus('⚠️ Por favor, preencha Nome e Telefone.');
      alert('Por favor, preencha seu nome e telefone para continuar.');
      return;
    }

    if (!selectedDay || !selectedSlot) {
      setStatus('⚠️ Selecione um horário disponível.');
      return;
    }

    const confirmacao = confirm(
      `Confirme seus dados para o agendamento:\n\n` +
      `👤 Nome: ${name}\n` +
      `📞 Telefone: ${phone}\n` +
      `✂️ Serviço: ${selectedService}\n` +
      `📅 Data: ${selectedDay.split('-').reverse().join('/')}\n` +
      `⏰ Hora: ${selectedSlot}\n\n` +
      `Deseja finalizar o agendamento?`
    );

    if (!confirmacao) return;

    setStatus('Salvando agendamento...');
    
    try {
      // 1. Verificação extra de duplicidade
      const { data: existente } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('data', selectedDay)
        .eq('hora', selectedSlot)
        .maybeSingle();

      if (existente) {
        throw new Error('Este horário acabou de ser preenchido por outra pessoa. Por favor, escolha outro.');
      }

      // 2. Inserção
      const { error } = await supabase
        .from('agendamentos')
        .insert([{
          nome: name,
          telefone: phone,
          servico: selectedService,
          data: selectedDay,
          hora: selectedSlot,
          funcionario: employee || 'Sem preferência',
          status: 'pendente'
        }]);

      if (error) throw error;

      setStatus('✅ Agendamento salvo com sucesso!');
      alert('✅ Agendamento realizado com sucesso e salvo no sistema!');

      closeModal();
      fetchOccupiedSlots(selectedDay);
    } catch (err: any) {
      console.error('Erro:', err);
      alert('❌ ' + (err.message || 'Erro ao processar agendamento'));
      setStatus('❌ Erro: ' + err.message);
      fetchOccupiedSlots(selectedDay);
    }
  };

  // --- Render Helpers ---
  const renderDays = () => {
    const ref = modalState.startRef;
    const start = new Date(ref);
    start.setDate(start.getDate() - start.getDay());
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const isSelected = iso === modalState.selectedDay;
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      
      return (
        <button 
          key={iso}
          type="button" 
          className={`day-chip ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDayChange(iso)}
        >
          <div>{weekday}</div>
          <div>{d.getDate().toString().padStart(2, '0')}</div>
        </button>
      );
    });
  };

  const renderSlots = () => {
    if (loadingSlots) return <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>Carregando horários...</p>;
    
    const date = new Date(modalState.selectedDay);
    if (isClosed(date)) return <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>Barbearia fechada neste dia.</p>;

    const periodRange = () => {
      if (modalState.period === 'morning') return ['09:00', '12:00'];
      if (modalState.period === 'afternoon') return ['12:00', '17:00'];
      return ['17:00', '19:00'];
    };

    const [ps, pe] = periodRange();
    const start = Math.max(toMinutes(SCHEDULE.start), toMinutes(ps));
    const end = Math.min(toMinutes(SCHEDULE.end), toMinutes(pe));
    
    const agora = new Date();
    const hojeIso = agora.toISOString().slice(0, 10);
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    const slots = [];
    for (let m = start; m < end; m += SCHEDULE.slotMinutes) {
      const t = fromMinutes(m);
      const estaOcupado = occupiedSlots.includes(t);
      const jaPassou = (modalState.selectedDay === hojeIso && m <= minutosAgora);
      const isSelected = modalState.selectedSlot === t;

      slots.push(
        <button
          key={t}
          type="button"
          className={`slot ${estaOcupado || jaPassou ? 'unavailable' : 'available'} ${isSelected ? 'selected' : ''}`}
          disabled={estaOcupado || jaPassou}
          onClick={() => setModalState(prev => ({ ...prev, selectedSlot: t }))}
          title={estaOcupado ? "Horário já reservado" : jaPassou ? "Horário indisponível" : ""}
        >
          {t}
        </button>
      );
    }
    return slots;
  };

  return (
    <div className="min-h-screen">
      <header className="header">
        <div className="brand">
          <Image className="logo" src="/assets/logo.svg" alt="Logo" width={40} height={40} />
          Barbearia Brutos Black
        </div>
        <nav className="nav">
          <a href="#home">Início</a>
          <a href="#booking" onClick={(e) => { e.preventDefault(); openModal(); }}>Agendamento</a>
          <a href="#services">Serviços</a>
          <a href="#location">Localização</a>
        </nav>
      </header>

      <main>
        <section id="home" className="section hero">
          <h1>Bem-vindo à Barbearia Brutos Black!</h1>
          <p>Aqui você encontra cortes modernos, atendimento personalizado e um ambiente agradável.</p>
          <p>Agende seu horário de forma rápida e prática pelo nosso site!</p>
          <button className="btn" id="cta-book" onClick={() => openModal()}>Agendar agora</button>
        </section>

        <nav className="tabs">
          <a href="#services">Serviços</a>
          <a href="#booking" onClick={(e) => { e.preventDefault(); openModal(); }}>Agendar</a>
          <a href="#about">Sobre</a>
          <a href="#reviews">Avaliações</a>
          <a href="#gallery">Galeria</a>
        </nav>

        <section id="services" className="section">
          <h2>Serviços</h2>
          <div className="cards">
            {Object.entries(SERVICE_DATA).map(([name, data]) => (
              <div className="card" key={name}>
                <h3>{name}</h3>
                <p>{name === "Corte Masculino" ? "Corte com estilo e acabamento cuidadoso." : 
                   name === "Barba" ? "Modelagem e hidratação para a barba." :
                   name === "Corte Infantil" ? "Cuidado especial para os pequenos." : 
                   "Pacote completo com preço especial."}</p>
                <div className="meta">Duração: {data.duration} min</div>
                <div className="actions">
                  <button className="btn small" onClick={() => openModal(name)}>Agendar</button>
                  <span className="price">R$ {data.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="location" className="section">
          <h2>Localização</h2>
          <p>Nosso endereço: Av Dom Helder Câmara, nº 6295, 6295, 20771-002, Rio de Janeiro</p>
          <div className="map-wrap">
            <iframe 
              id="map" 
              loading="lazy" 
              src="https://www.google.com/maps?q=Av%20Dom%20Helder%20C%C3%A2mara%2C%20n%C2%BA%206295%2C%206295%2C%2020771-002%2C%20Rio%20de%20Janeiro&output=embed"
            ></iframe>
          </div>
          <p>Confira no mapa acima como chegar até nós.</p>
        </section>

        <section id="about" className="section">
          <h2>Sobre</h2>
          <p>Barbearia Brutos Black oferece experiência premium com profissionais qualificados e ambiente moderno.</p>
          <p>Horário de funcionamento: Segunda a Sábado, 09:00 — 19:00. Domingo fechado.</p>
        </section>

        <section id="reviews" className="section">
          <h2>Avaliações</h2>
          <div className="cards">
            <div className="card"><h3>★★★★★</h3><p>Atendimento top e corte impecável.</p><div className="meta">João S.</div></div>
            <div className="card"><h3>★★★★★</h3><p>Ambiente agradável e pontualidade.</p><div className="meta">Marcos A.</div></div>
            <div className="card"><h3>★★★★☆</h3><p>Ótimo custo-benefício.</p><div className="meta">Pedro C.</div></div>
          </div>
        </section>

        <section id="gallery" className="section">
          <h2>Galeria</h2>
          <div className="gallery">
            <div className="ph"></div><div className="ph"></div><div className="ph"></div>
            <div className="ph"></div><div className="ph"></div><div className="ph"></div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; Barbearia Brutos Black</p>
      </footer>

      {/* --- Modal --- */}
      {isModalOpen && (
        <div className="modal-overlay open">
          <div className="modal">
            <button className="modal-close" onClick={closeModal} aria-label="Fechar">×</button>
            <div className="modal-header">
              <button className="icon-btn" onClick={() => changeWeek(-7)}>‹</button>
              <div className="month-title">
                {modalState.startRef.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
              </div>
              <button className="icon-btn" onClick={() => changeWeek(7)}>›</button>
            </div>
            <div className="day-chips">{renderDays()}</div>
            <div className="period-tabs">
              <button className={`pill ${modalState.period === 'morning' ? 'selected' : ''}`} onClick={() => handlePeriodChange('morning')}>Manhã</button>
              <button className={`pill ${modalState.period === 'afternoon' ? 'selected' : ''}`} onClick={() => handlePeriodChange('afternoon')}>Tarde</button>
              <button className={`pill ${modalState.period === 'evening' ? 'selected' : ''}`} onClick={() => handlePeriodChange('evening')}>Noite</button>
            </div>
            <div className="slot-grid">{renderSlots()}</div>
            
            <div className="service-select">
              {Object.keys(SERVICE_DATA).map(k => (
                <label key={k} className="service-option">
                  <div>
                    <input 
                      type="radio" 
                      name="service-radio" 
                      checked={modalState.selectedService === k} 
                      onChange={() => setModalState(prev => ({ ...prev, selectedService: k }))}
                    />
                    <span>{k}</span>
                  </div>
                  <div>
                    <span className="meta">{SERVICE_DATA[k].duration} min</span>
                    <span className="price">{formatCurrency(SERVICE_DATA[k].price)}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="summary">
              <div className="service-row">
                <div className="service-info">
                  <div>{modalState.selectedService}</div>
                  <div className="meta">{SERVICE_DATA[modalState.selectedService].duration} min</div>
                </div>
                <div className="price">{formatCurrency(SERVICE_DATA[modalState.selectedService].price)}</div>
              </div>
              <label>
                Funcionário
                <select value={formData.employee} onChange={(e) => setFormData(prev => ({ ...prev, employee: e.target.value }))}>
                  <option value="">Sem preferência</option>
                  <option value="Leandro">Leandro</option>
                  <option value="Douglas">Douglas</option>
                </select>
              </label>
              <div className="total">Total: {formatCurrency(SERVICE_DATA[modalState.selectedService].price)}</div>
            </div>

            <div className="grid">
              <label>
                Nome completo
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                  required 
                />
              </label>
              <label>
                Telefone
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
                  required 
                />
              </label>
            </div>

            <div className="status">{status}</div>
            <div className="actions-row">
              <button 
                className="btn secondary large" 
                style={{ width: '100%' }}
                onClick={handleBooking}
              >
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
