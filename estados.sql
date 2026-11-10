-- PERMISO PARA CAMBIAR EL ESTADO DE LAS LIMPIEZAS
-- Pegar en Supabase > SQL Editor > Run (una sola vez).
-- Permite que admin, coord y lector (las cleaners) cambien el estado
-- (Pendiente, En curso, Realizada, Incompleta, Cancelada). No les da permiso para nada más.
drop policy if exists "equipo escribe estados" on public.docs;
create policy "equipo escribe estados" on public.docs
  for all to authenticated
  using (public.mi_rol() in ('admin','coord','lector') and coleccion = 'estados')
  with check (public.mi_rol() in ('admin','coord','lector') and coleccion = 'estados');
