-- Create agendamentos table
create table if not exists public.agendamentos (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    nome text not null,
    telefone text not null,
    servico text,
    data date not null,
    hora text not null,
    funcionario text,
    status text default 'pendente',
    unique(data, hora) -- Garante que não existam dois agendamentos no mesmo dia e hora
);

-- Enable RLS
alter table public.agendamentos enable row level security;

-- Create policies
create policy "Allow public insert" on public.agendamentos for insert with check (true);
create policy "Allow public select" on public.agendamentos for select using (true);
