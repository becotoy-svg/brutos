const navLinks=document.querySelectorAll('.nav a');

// Configuração Supabase (Substitua pelos seus dados do Dashboard do Supabase)
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';
const supabaseClient = (window.supabase && SUPABASE_URL) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

navLinks.forEach(l=>{l.addEventListener('click',e=>{const href=l.getAttribute('href');if(href==='#booking'){e.preventDefault();openModal();return}e.preventDefault();const t=document.querySelector(href);t&&t.scrollIntoView({behavior:'smooth'})})});

// Função para salvar agendamento no Supabase
async function salvarNoSupabase(d) {
    if (!supabaseClient) {
        console.error('Supabase não inicializado');
        return { error: 'SDK do Supabase não carregado' };
    }
    
    const { data, error } = await supabaseClient
        .from('agendamentos')
        .insert([
            { 
                nome: d.nome, 
                telefone: d.telefone, 
                servico: d.servico, 
                data: d.data, 
                hora: d.hora,
                funcionario: employeeSelect.value || 'Sem preferência',
                status: 'pendente'
            }
        ]);
    
    return { data, error };
}
document.querySelectorAll('.tabs a').forEach(l=>{l.addEventListener('click',e=>{const href=l.getAttribute('href');if(href==='#booking'){e.preventDefault();openModal();return}e.preventDefault();const t=document.querySelector(href);t&&t.scrollIntoView({behavior:'smooth'})})});
const headerLogo=document.querySelector('.logo');
headerLogo&&headerLogo.addEventListener('error',()=>{headerLogo.style.display='none'});

const modalStatus=document.getElementById('modal-status');
const WHATSAPP_NUMERO='5521990039787'; // Número atualizado
const modalName=document.getElementById('modal-name');
const modalPhone=document.getElementById('modal-phone');
const modalWhatsBtn=document.getElementById('modal-whats-btn');
const SCHEDULE={slotMinutes:30,start:'09:00',end:'19:00',closedWeekdays:[0]};   
const MODAL=document.getElementById('booking-modal');
const modalClose=document.getElementById('modal-close');
const dayChips=document.getElementById('day-chips');
const monthTitle=document.getElementById('month-title');
const modalSlotGrid=document.getElementById('modal-slot-grid');
const periodTabs=document.getElementById('period-tabs');
const prevWeek=document.getElementById('prev-week');
const nextWeek=document.getElementById('next-week');
const selectedServiceEl=document.getElementById('selected-service');
const selectedDurationEl=document.getElementById('selected-duration');
const selectedPriceEl=document.getElementById('selected-price');
const employeeSelect=document.getElementById('employee-select');
const totalPriceEl=document.getElementById('total-price');
const serviceSelectEl=document.getElementById('service-select');
const changeServiceBtn=document.getElementById('change-service');
const SERVICE_DATA={"Corte Masculino":{duration:45,price:35},"Barba":{duration:30,price:25},"Corte Infantil":{duration:30,price:25},"Combo Corte + Barba":{duration:75,price:55}};
let modalState={startRef:new Date(),selectedDay:null,period:'morning',selectedSlot:null,selectedService:null};
const ctaBook=document.getElementById('cta-book');
ctaBook&&ctaBook.addEventListener('click',e=>{e.preventDefault();openModal()}); 

function textoAgendamento(){
const nome=modalName.value.trim();
const telefone=modalPhone.value.trim();
const data=modalState.selectedDay;
const hora=modalState.selectedSlot;
const servico=selectedServiceEl.textContent;
return {nome,telefone,data,hora,servico};
}

function valido(d){
return d.nome&&d.telefone&&d.data&&d.hora;
}

function atualizarStatus(t){
modalStatus.textContent=t;
}

function toMinutes(t){
const p=t.split(':');
return parseInt(p[0],10)*60+parseInt(p[1],10);
}

function fromMinutes(m){
const h=Math.floor(m/60).toString().padStart(2,'0');
const mi=(m%60).toString().padStart(2,'0');
return h+':'+mi;
}

function isClosed(date){
return SCHEDULE.closedWeekdays.includes(date.getDay());
}

function nextOpenDate(d){
let x=new Date(d);
for(let i=0;i<7;i++){if(!isClosed(x))return x;x.setDate(x.getDate()+1)}
return d;
}

/* slots na página removidos; usando apenas slots do modal */

function updateSelectedSlot(target){
if(!target.classList.contains('available'))return;
const sel=slotGrid.querySelector('.slot.selected');
if(sel)sel.classList.remove('selected');
target.classList.add('selected');
timeInput.value=target.dataset.time;
}

/* inicialização de slots da página removida */

function currency(n){return 'R$ '+n.toFixed(2).replace('.',',')}

function openModal(service){MODAL.hidden=false;MODAL.classList.add('open');document.body.style.overflow='hidden';if(service){setService(service)}renderDays(modalState.startRef);selectDefaultDay();renderPeriodTabs();renderModalSlots();renderServiceOptions();updateTotal()}
function closeModal(){MODAL.classList.remove('open');MODAL.hidden=true;document.body.style.overflow='';}
modalClose.addEventListener('click',closeModal);

function renderDays(ref){dayChips.innerHTML='';const month=ref.toLocaleString('pt-BR',{month:'long'});const year=ref.getFullYear();monthTitle.textContent=month.charAt(0).toUpperCase()+month.slice(1)+' '+year;const start=new Date(ref);start.setDate(start.getDate()-(start.getDay()));for(let i=0;i<7;i++){const d=new Date(start);d.setDate(start.getDate()+i);const b=document.createElement('button');b.type='button';b.className='day-chip';b.dataset.iso=d.toISOString().slice(0,10);b.innerHTML='<div>'+d.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','')+'</div><div>'+d.getDate().toString().padStart(2,'0')+'</div>';dayChips.appendChild(b)}}
function selectDefaultDay(){const today=new Date();modalState.selectedDay=today.toISOString().slice(0,10);highlightSelectedDay()}
function highlightSelectedDay(){dayChips.querySelectorAll('.day-chip').forEach(c=>{c.classList.toggle('selected',c.dataset.iso===modalState.selectedDay)})}     
dayChips.addEventListener('click',e=>{const t=e.target.closest('.day-chip');if(!t)return;modalState.selectedDay=t.dataset.iso;highlightSelectedDay();renderModalSlots()});
prevWeek.addEventListener('click',()=>{modalState.startRef.setDate(modalState.startRef.getDate()-7);renderDays(modalState.startRef);highlightSelectedDay();renderModalSlots()});
nextWeek.addEventListener('click',()=>{modalState.startRef.setDate(modalState.startRef.getDate()+7);renderDays(modalState.startRef);highlightSelectedDay();renderModalSlots()});

function renderPeriodTabs(){periodTabs.querySelectorAll('.pill').forEach(p=>p.classList.toggle('selected',p.dataset.period===modalState.period))}
periodTabs.addEventListener('click',e=>{const p=e.target.closest('.pill');if(!p)return;modalState.period=p.dataset.period;renderPeriodTabs();renderModalSlots()});

function periodRange(){if(modalState.period==='morning')return ['09:00','12:00'];if(modalState.period==='afternoon')return ['12:00','17:00'];return ['17:00','19:00']}

// Função para buscar horários ocupados no Supabase
async function buscarHorariosOcupados(data) {
    if (!supabaseClient) return [];
    const { data: agendamentos, error } = await supabaseClient
        .from('agendamentos')
        .select('hora')
        .eq('data', data);
    
    if (error) {
        console.error('Erro ao buscar horários:', error);
        return [];
    }
    return agendamentos.map(a => a.hora);
}

async function renderModalSlots(){
    modalSlotGrid.innerHTML='<p style="grid-column: 1/-1; text-align: center;">Carregando horários...</p>';
    const date=new Date(modalState.selectedDay);
    if(isClosed(date)){
        modalSlotGrid.innerHTML='<p style="grid-column: 1/-1; text-align: center;">Barbearia fechada neste dia.</p>';
        return;
    }

    const ocupados = await buscarHorariosOcupados(modalState.selectedDay);
    modalSlotGrid.innerHTML='';

    const [ps,pe]=periodRange();
    const start=Math.max(toMinutes(SCHEDULE.start),toMinutes(ps));
    const end=Math.min(toMinutes(SCHEDULE.end),toMinutes(pe));
    
    const agora = new Date();
    const hojeIso = agora.toISOString().slice(0,10);
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    const frag=document.createDocumentFragment();
    for(let m=start;m<end;m+=SCHEDULE.slotMinutes){
        const t=fromMinutes(m);
        const b=document.createElement('button');
        b.type='button';
        
        // Regra 1: Horário já ocupado no banco
        const estaOcupado = ocupados.includes(t);
        // Regra 2: Horário já passou (se for hoje)
        const jaPassou = (modalState.selectedDay === hojeIso && m <= minutosAgora);

        b.className = (estaOcupado || jaPassou) ? 'slot unavailable' : 'slot available';
        b.textContent=t;
        b.dataset.time=t;
        
        if (estaOcupado) b.title = "Horário já reservado";
        if (jaPassou) b.title = "Horário indisponível";

        frag.appendChild(b);
    }
    modalSlotGrid.appendChild(frag);
}
modalSlotGrid.addEventListener('click',e=>{const t=e.target;if(!t.classList.contains('slot'))return;modalState.selectedSlot=t.dataset.time;modalSlotGrid.querySelectorAll('.slot').forEach(s=>s.classList.toggle('selected',s===t))});

function setService(name){const d=SERVICE_DATA[name];selectedServiceEl.textContent=name;selectedDurationEl.textContent=d?d.duration+' min':'';selectedPriceEl.textContent=d?currency(d.price):'';modalState.selectedService=name;updateTotal();syncServiceRadios(name)}
function updateTotal(){const d=SERVICE_DATA[modalState.selectedService];const total=d?d.price:0;totalPriceEl.textContent=currency(total)}
function renderServiceOptions(){serviceSelectEl.innerHTML='';Object.keys(SERVICE_DATA).forEach(k=>{const d=SERVICE_DATA[k];const label=document.createElement('label');label.className='service-option';const left=document.createElement('div');const radio=document.createElement('input');radio.type='radio';radio.name='service-radio';radio.value=k;radio.checked=modalState.selectedService?modalState.selectedService===k:false;left.appendChild(radio);const txt=document.createElement('span');txt.textContent=k;left.appendChild(txt);label.appendChild(left);const right=document.createElement('div');const meta=document.createElement('span');meta.className='meta';meta.textContent=d.duration+' min';right.appendChild(meta);const price=document.createElement('span');price.className='price';price.textContent=currency(d.price);right.appendChild(price);label.appendChild(right);label.addEventListener('change',()=>{setService(k)});serviceSelectEl.appendChild(label)});
if(!modalState.selectedService){const first=Object.keys(SERVICE_DATA)[0];setService(first)}}
function syncServiceRadios(name){const r=serviceSelectEl.querySelectorAll('input[name="service-radio"]');r.forEach(el=>{el.checked=el.value===name})}
changeServiceBtn.addEventListener('click',()=>{serviceSelectEl.scrollIntoView({behavior:'smooth'})});

function corpoMensagem(d){
return 'Nome: '+d.nome+'\nTelefone: '+d.telefone+'\nServiço: '+d.servico+'\nData: '+d.data+'\nHora: '+d.hora+'\nFuncionário: '+(employeeSelect.value||'Sem preferência');
}
modalWhatsBtn.addEventListener('click', async ()=>{
    const d=textoAgendamento();
    
    // Validação obrigatória
    if(!d.nome || !d.telefone){
        atualizarStatus('⚠️ Por favor, preencha Nome e Telefone.');
        alert('Por favor, preencha seu nome e telefone para continuar.');
        return;
    }
    
    if(!d.data || !d.hora){
        atualizarStatus('⚠️ Selecione um horário disponível.');
        return;
    }

    // Confirmação dos dados
    const confirmacao = confirm(
        `Confirme seus dados para o agendamento:\n\n` +
        `👤 Nome: ${d.nome}\n` +
        `📞 Telefone: ${d.telefone}\n` +
        `✂️ Serviço: ${d.servico}\n` +
        `📅 Data: ${d.data.split('-').reverse().join('/')}\n` +
        `⏰ Hora: ${d.hora}\n\n` +
        `Deseja finalizar o agendamento?`
    );

    if(!confirmacao) return;

    atualizarStatus('Salvando agendamento...');
    const { error } = await salvarNoSupabase(d);

    if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        atualizarStatus('Erro ao salvar no banco. Tentando WhatsApp...');
    } else {
        atualizarStatus('✅ Agendamento salvo com sucesso!');
        alert('✅ Agendamento realizado com sucesso e salvo no sistema!');
    }

    const msgText = '💈 *NOVO AGENDAMENTO - BRUTOS BLACK* 💈\n\n' + 
        '👤 *Cliente:* ' + d.nome + '\n' +
        '📞 *Telefone:* ' + d.telefone + '\n' +
        '✂️ *Serviço:* ' + d.servico + '\n' +
        '📅 *Data:* ' + d.data.split('-').reverse().join('/') + '\n' +
        '⏰ *Hora:* ' + d.hora + '\n' +
        '🧔 *Barbeiro:* ' + (employeeSelect.value || 'Sem preferência') + '\n\n' +
        '✅ _Agendamento salvo automaticamente no banco de dados._';

    const msgEncoded = encodeURIComponent(msgText);

    // Detecção de dispositivo para escolher entre WhatsApp Web ou App
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let url;
    if (isMobile) {
        // Abre o App do WhatsApp no Mobile
        url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${msgEncoded}`;
    } else {
        // Abre o WhatsApp Web no Desktop
        url = `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${msgEncoded}`;
    }

    window.open(url, '_blank');
    closeModal(); 
    renderModalSlots(); 
});

/* envio pela seção de página removido; usando envio pelo modal */
document.querySelectorAll('[data-service]').forEach(b=>{b.addEventListener('click',()=>{const val=b.getAttribute('data-service');openModal(val)})});
