-- Agrega la opción "n/a" al constraint de modalidad de empleados
alter table empleados drop constraint if exists empleados_modalidad_check;
alter table empleados
  add constraint empleados_modalidad_check
  check (modalidad in ('presencial', 'home_office', 'hibrido', 'n/a'));
