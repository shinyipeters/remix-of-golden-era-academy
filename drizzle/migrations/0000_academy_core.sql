
-- ENUMS
create type public.app_role as enum ('super_admin','admin','student');
create type public.admin_permission as enum ('courses','students','payments','content','enquiries','settings','certificates','exports');
create type public.enrolment_status as enum ('registration_received','awaiting_payment','payment_submitted','payment_verified','admission_approved','enrolled','rejected','suspended','completed','certificate_issued');
create type public.payment_status as enum ('not_started','awaiting_payment','submitted','verified','rejected','disputed','refunded');
create type public.enquiry_status as enum ('new','in_progress','awaiting_response','resolved');
create type public.content_status as enum ('draft','published','archived');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create table public.admin_permissions (
  user_id uuid not null,
  permission public.admin_permission not null,
  created_at timestamptz not null default now(),
  primary key (user_id, permission)
);
grant select on public.admin_permissions to authenticated;
grant all on public.admin_permissions to service_role;
alter table public.admin_permissions enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('super_admin','admin'))
$$;

create or replace function public.has_perm(_user_id uuid, _perm public.admin_permission)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id,'super_admin')
    or (public.has_role(_user_id,'admin') and exists (select 1 from public.admin_permissions where user_id=_user_id and permission=_perm))
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_perm(auth.uid(),'students') or public.has_perm(auth.uid(),'payments') or public.has_perm(auth.uid(),'certificates'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "staff profile update" on public.profiles for update to authenticated using (public.has_perm(auth.uid(),'students'));
create policy "roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'super_admin'));
create policy "perms read" on public.admin_permissions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'super_admin'));

-- AUDIT
create table public.audit_logs (
  id bigserial primary key,
  actor_id uuid,
  actor_email text,
  action text not null,
  entity text not null,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  reason text,
  created_at timestamptz not null default now()
);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "super admin reads audit" on public.audit_logs for select to authenticated using (public.has_role(auth.uid(),'super_admin'));

create or replace function public.write_audit(_action text, _entity text, _entity_id text, _old jsonb, _new jsonb, _reason text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs(actor_id, actor_email, action, entity, entity_id, old_values, new_values, reason)
  values (auth.uid(), (select email from public.profiles where id = auth.uid()), _action, _entity, _entity_id, _old, _new, _reason);
end $$;
revoke execute on function public.write_audit(text,text,text,jsonb,jsonb,text) from public, anon, authenticated;

create or replace function public.audit_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare _id text;
begin
  if tg_op = 'DELETE' then _id := (to_jsonb(old)->>'id'); if _id is null then _id := to_jsonb(old)->>'key'; end if;
    perform public.write_audit('delete', tg_table_name, _id, to_jsonb(old), null);
    return old;
  elsif tg_op = 'UPDATE' then _id := (to_jsonb(new)->>'id'); if _id is null then _id := to_jsonb(new)->>'key'; end if;
    if to_jsonb(old) is distinct from to_jsonb(new) then
      perform public.write_audit('update', tg_table_name, _id, to_jsonb(old), to_jsonb(new));
    end if;
    return new;
  else _id := (to_jsonb(new)->>'id'); if _id is null then _id := to_jsonb(new)->>'key'; end if;
    perform public.write_audit('create', tg_table_name, _id, null, to_jsonb(new));
    return new;
  end if;
end $$;

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  body text,
  link text,
  dedupe_key text unique,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "staff read notifications" on public.notifications for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff update notifications" on public.notifications for update to authenticated using (public.is_staff(auth.uid()));

create or replace function public.notify(_kind text, _title text, _body text, _link text, _dedupe text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications(kind,title,body,link,dedupe_key) values (_kind,_title,_body,_link,_dedupe)
  on conflict (dedupe_key) do nothing;
end $$;
revoke execute on function public.notify(text,text,text,text,text) from public, anon, authenticated;

-- NEW USER
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), coalesce(new.email,''), new.raw_user_meta_data->>'phone');
  if lower(new.email) = 'shinyipeters@gmail.com' and not exists (select 1 from public.user_roles where role='super_admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'super_admin');
  else
    insert into public.user_roles(user_id, role) values (new.id, 'student');
    perform public.notify('registration','New student registration', coalesce(new.raw_user_meta_data->>'full_name', new.email), '/admin/students', 'reg-'||new.id);
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- SETTINGS
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select to anon, authenticated using (key <> 'notifications');
create policy "staff read private settings" on public.site_settings for select to authenticated using (public.has_perm(auth.uid(),'settings'));
create policy "settings write" on public.site_settings for insert to authenticated with check (
  case when key in ('bank','notifications') then public.has_role(auth.uid(),'super_admin')
       when key in ('founder','policies','partnerships','about') then public.has_perm(auth.uid(),'content') or public.has_perm(auth.uid(),'settings')
       else public.has_perm(auth.uid(),'settings') end);
create policy "settings update" on public.site_settings for update to authenticated using (
  case when key in ('bank','notifications') then public.has_role(auth.uid(),'super_admin')
       when key in ('founder','policies','partnerships','about') then public.has_perm(auth.uid(),'content') or public.has_perm(auth.uid(),'settings')
       else public.has_perm(auth.uid(),'settings') end);
create trigger audit_settings after insert or update or delete on public.site_settings for each row execute function public.audit_trigger();

-- COURSES
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null default '',
  description text not null default '',
  suitable_for text not null default '',
  objectives text[] not null default '{}',
  curriculum text[] not null default '{}',
  outcomes text not null default '',
  duration text,
  price numeric(12,2),
  currency text not null default 'NGN',
  entry_requirements text not null default '',
  enrolment_instructions text not null default '',
  certification_requirements text not null default '',
  delivery_notes text not null default '',
  disclaimer text not null default '',
  image_path text,
  icon text not null default 'book',
  status public.content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.courses to anon, authenticated;
grant insert, update, delete on public.courses to authenticated;
grant all on public.courses to service_role;
alter table public.courses enable row level security;
create policy "public published courses" on public.courses for select to anon, authenticated using (status = 'published' or public.has_perm(auth.uid(),'courses'));
create policy "staff write courses" on public.courses for insert to authenticated with check (public.has_perm(auth.uid(),'courses'));
create policy "staff update courses" on public.courses for update to authenticated using (public.has_perm(auth.uid(),'courses'));
create policy "super delete courses" on public.courses for delete to authenticated using (public.has_role(auth.uid(),'super_admin'));
create trigger audit_courses after insert or update or delete on public.courses for each row execute function public.audit_trigger();

create table public.course_training (
  course_id uuid primary key references public.courses(id) on delete cascade,
  platform text not null default '',
  link text not null default '',
  instructions text not null default '',
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.course_training to authenticated;
grant all on public.course_training to service_role;
alter table public.course_training enable row level security;

-- ENROLMENTS
create sequence public.app_ref_seq start 1001;
create table public.enrolments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('GEDA-' || to_char(now(),'YY') || '-' || lpad(nextval('public.app_ref_seq')::text, 5, '0')),
  student_id uuid not null,
  course_id uuid not null references public.courses(id),
  course_title text not null,
  amount_due numeric(12,2),
  currency text not null default 'NGN',
  status public.enrolment_status not null default 'awaiting_payment',
  payment_status public.payment_status not null default 'awaiting_payment',
  requirements_met boolean not null default false,
  certificate_number text unique,
  certificate_issued_at timestamptz,
  certificate_issued_by uuid,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.enrolments to authenticated;
grant all on public.enrolments to service_role;
alter table public.enrolments enable row level security;
create policy "own or staff enrolments" on public.enrolments for select to authenticated using (student_id = auth.uid() or public.has_perm(auth.uid(),'students') or public.has_perm(auth.uid(),'payments') or public.has_perm(auth.uid(),'certificates'));
create policy "staff update enrolments" on public.enrolments for update to authenticated using (public.has_perm(auth.uid(),'students') or public.has_perm(auth.uid(),'certificates'));
create trigger audit_enrolments after update on public.enrolments for each row execute function public.audit_trigger();

create policy "training read" on public.course_training for select to authenticated using (
  public.has_perm(auth.uid(),'courses') or exists (select 1 from public.enrolments e where e.course_id = course_training.course_id and e.student_id = auth.uid() and e.status in ('admission_approved','enrolled','completed','certificate_issued')));
create policy "training write" on public.course_training for insert to authenticated with check (public.has_perm(auth.uid(),'courses'));
create policy "training update" on public.course_training for update to authenticated using (public.has_perm(auth.uid(),'courses'));
create policy "training delete" on public.course_training for delete to authenticated using (public.has_perm(auth.uid(),'courses'));
create trigger audit_training after insert or update or delete on public.course_training for each row execute function public.audit_trigger();

-- prevent non-cert staff from issuing certs, guard fields
create or replace function public.guard_enrolment_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.certificate_number is distinct from old.certificate_number or new.requirements_met is distinct from old.requirements_met or new.status = 'certificate_issued' and old.status <> 'certificate_issued')
     and not public.has_perm(auth.uid(),'certificates') then
    raise exception 'You do not have permission to manage certificates';
  end if;
  if new.status = 'certificate_issued' and old.status <> 'certificate_issued' then
    if not new.requirements_met then raise exception 'Certification requirements must be marked as met first'; end if;
    if new.payment_status <> 'verified' then raise exception 'Payment must be verified before a certificate is issued'; end if;
    if new.certificate_number is null then new.certificate_number := 'GEDA-CERT-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)); end if;
    new.certificate_issued_at := now(); new.certificate_issued_by := auth.uid();
  end if;
  if new.payment_status is distinct from old.payment_status and not public.has_perm(auth.uid(),'payments') and auth.uid() is not null then
    raise exception 'Payment status can only be changed through payment review';
  end if;
  new.student_id := old.student_id; new.course_id := old.course_id; new.reference := old.reference;
  new.updated_at := now();
  return new;
end $$;
create trigger guard_enrolment before update on public.enrolments for each row execute function public.guard_enrolment_update();

create or replace function public.create_enrolment(_course_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare c record; r text; p record;
begin
  if auth.uid() is null then raise exception 'Please sign in first'; end if;
  select * into c from public.courses where id = _course_id and status = 'published';
  if not found then raise exception 'Course not available'; end if;
  if exists (select 1 from public.enrolments where student_id = auth.uid() and course_id = _course_id and status not in ('rejected','completed','certificate_issued')) then
    raise exception 'You already have an active application for this course';
  end if;
  insert into public.enrolments(student_id, course_id, course_title, amount_due, currency)
  values (auth.uid(), c.id, c.title, c.price, c.currency) returning reference into r;
  select full_name into p from public.profiles where id = auth.uid();
  perform public.notify('enrolment','New enrolment application', coalesce(p.full_name,'A student')||' applied for '||c.title||' ('||r||')', '/admin/admissions', 'enr-'||r);
  return r;
end $$;
revoke execute on function public.create_enrolment(uuid) from public, anon;
grant execute on function public.create_enrolment(uuid) to authenticated;

-- PAYMENTS
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.enrolments(id) on delete cascade,
  student_id uuid not null,
  method text not null,
  amount_submitted numeric(12,2),
  transaction_reference text,
  evidence_path text,
  student_note text,
  status public.payment_status not null default 'submitted',
  admin_notes text,
  verified_at timestamptz,
  verified_by uuid,
  verified_by_email text,
  created_at timestamptz not null default now()
);
grant select, insert on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "own or staff payments" on public.payments for select to authenticated using (student_id = auth.uid() or public.has_perm(auth.uid(),'payments'));
create policy "students submit payments" on public.payments for insert to authenticated with check (
  student_id = auth.uid() and status = 'submitted' and verified_at is null and verified_by is null
  and exists (select 1 from public.enrolments e where e.id = enrolment_id and e.student_id = auth.uid() and e.payment_status in ('awaiting_payment','rejected','not_started')));

create table public.payment_history (
  id bigserial primary key,
  payment_id uuid references public.payments(id) on delete cascade,
  enrolment_id uuid,
  actor_id uuid,
  actor_email text,
  previous_status text,
  new_status text not null,
  reason text,
  created_at timestamptz not null default now()
);
grant select on public.payment_history to authenticated;
grant all on public.payment_history to service_role;
alter table public.payment_history enable row level security;
create policy "staff read payment history" on public.payment_history for select to authenticated using (public.has_perm(auth.uid(),'payments'));

create or replace function public.on_payment_submitted()
returns trigger language plpgsql security definer set search_path = public as $$
declare e record; p record;
begin
  select * into e from public.enrolments where id = new.enrolment_id;
  update public.enrolments set payment_status='submitted', status = case when status in ('registration_received','awaiting_payment') then 'payment_submitted' else status end where id = e.id;
  insert into public.payment_history(payment_id, enrolment_id, actor_id, previous_status, new_status, reason) values (new.id, e.id, auth.uid(), e.payment_status::text, 'submitted', 'Student submitted payment details');
  select full_name into p from public.profiles where id = new.student_id;
  perform public.notify('payment','Payment awaiting verification', coalesce(p.full_name,'Student')||' — '||e.course_title||' ('||e.reference||') via '||new.method, '/admin/payments', 'pay-'||new.id);
  return new;
end $$;
create trigger payment_submitted after insert on public.payments for each row execute function public.on_payment_submitted();

create or replace function public.review_payment(_payment_id uuid, _decision public.payment_status, _notes text)
returns void language plpgsql security definer set search_path = public as $$
declare pay record; e record; actor text;
begin
  if not public.has_perm(auth.uid(),'payments') then raise exception 'You are not authorised to review payments'; end if;
  if _decision not in ('verified','rejected','disputed','refunded') then raise exception 'Invalid decision'; end if;
  if _decision in ('rejected','disputed') and coalesce(trim(_notes),'') = '' then raise exception 'Please give a reason'; end if;
  select * into pay from public.payments where id = _payment_id for update;
  if not found then raise exception 'Payment not found'; end if;
  select email into actor from public.profiles where id = auth.uid();
  select * into e from public.enrolments where id = pay.enrolment_id;
  update public.payments set status=_decision, admin_notes=_notes, verified_at=now(), verified_by=auth.uid(), verified_by_email=actor where id=_payment_id;
  update public.enrolments set payment_status = _decision,
    status = case when _decision='verified' and status in ('awaiting_payment','payment_submitted','registration_received') then 'payment_verified'
                  when _decision='rejected' and status='payment_submitted' then 'awaiting_payment'
                  else status end
  where id = e.id;
  insert into public.payment_history(payment_id, enrolment_id, actor_id, actor_email, previous_status, new_status, reason)
  values (_payment_id, e.id, auth.uid(), actor, pay.status::text, _decision::text, _notes);
  perform public.write_audit('payment_'||_decision::text, 'payments', _payment_id::text, jsonb_build_object('status',pay.status), jsonb_build_object('status',_decision,'enrolment',e.reference), _notes);
  perform public.notify('payment_review','Payment '||_decision::text, e.reference||' — '||e.course_title||' by '||coalesce(actor,'admin'), '/admin/payments', 'rev-'||_payment_id||'-'||_decision::text||'-'||extract(epoch from now())::bigint);
end $$;
revoke execute on function public.review_payment(uuid, public.payment_status, text) from public, anon;
grant execute on function public.review_payment(uuid, public.payment_status, text) to authenticated;

-- certificate verification (public)
create or replace function public.verify_certificate(_number text)
returns table(student_name text, course_title text, issued_at timestamptz) language sql stable security definer set search_path = public as $$
  select p.full_name, e.course_title, e.certificate_issued_at from public.enrolments e join public.profiles p on p.id = e.student_id
  where e.certificate_number = upper(trim(_number)) and e.status = 'certificate_issued'
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- ANNOUNCEMENTS
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  category text not null default 'News',
  image_path text,
  status public.content_status not null default 'draft',
  publish_at timestamptz not null default now(),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;
grant all on public.announcements to service_role;
alter table public.announcements enable row level security;
create policy "public announcements" on public.announcements for select to anon, authenticated using ((status='published' and publish_at <= now()) or public.has_perm(auth.uid(),'content'));
create policy "content insert ann" on public.announcements for insert to authenticated with check (public.has_perm(auth.uid(),'content'));
create policy "content update ann" on public.announcements for update to authenticated using (public.has_perm(auth.uid(),'content'));
create policy "content delete ann" on public.announcements for delete to authenticated using (public.has_perm(auth.uid(),'content'));
create trigger audit_ann after insert or update or delete on public.announcements for each row execute function public.audit_trigger();

-- GALLERY
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  caption text not null default '',
  consent_confirmed boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.gallery_items to anon, authenticated;
grant insert, update, delete on public.gallery_items to authenticated;
grant all on public.gallery_items to service_role;
alter table public.gallery_items enable row level security;
create policy "public gallery" on public.gallery_items for select to anon, authenticated using ((published and consent_confirmed) or public.has_perm(auth.uid(),'content'));
create policy "content insert gallery" on public.gallery_items for insert to authenticated with check (public.has_perm(auth.uid(),'content'));
create policy "content update gallery" on public.gallery_items for update to authenticated using (public.has_perm(auth.uid(),'content'));
create policy "content delete gallery" on public.gallery_items for delete to authenticated using (public.has_perm(auth.uid(),'content'));
create trigger audit_gallery after insert or update or delete on public.gallery_items for each row execute function public.audit_trigger();

-- ENQUIRIES
create sequence public.enq_ref_seq start 501;
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('ENQ-' || to_char(now(),'YY') || '-' || lpad(nextval('public.enq_ref_seq')::text, 5, '0')),
  source text not null default 'ceo',
  full_name text not null,
  email text not null,
  phone text,
  organisation text,
  category text not null,
  message text not null,
  preferred_contact text,
  status public.enquiry_status not null default 'new',
  assigned_to uuid,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;
create policy "staff read enquiries" on public.enquiries for select to authenticated using (public.has_perm(auth.uid(),'enquiries'));
create policy "staff update enquiries" on public.enquiries for update to authenticated using (public.has_perm(auth.uid(),'enquiries'));
create trigger audit_enq after update on public.enquiries for each row execute function public.audit_trigger();

create table public.enquiry_responses (
  id bigserial primary key,
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  author_id uuid,
  author_email text,
  channel text not null default 'email',
  note text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.enquiry_responses to authenticated;
grant all on public.enquiry_responses to service_role;
alter table public.enquiry_responses enable row level security;
create policy "staff read responses" on public.enquiry_responses for select to authenticated using (public.has_perm(auth.uid(),'enquiries'));
create policy "staff add responses" on public.enquiry_responses for insert to authenticated with check (public.has_perm(auth.uid(),'enquiries') and author_id = auth.uid());

create or replace function public.submit_enquiry(_source text, _full_name text, _email text, _phone text, _organisation text, _category text, _message text, _preferred text)
returns text language plpgsql security definer set search_path = public as $$
declare r text;
begin
  _full_name := trim(coalesce(_full_name,'')); _email := lower(trim(coalesce(_email,''))); _message := trim(coalesce(_message,''));
  if length(_full_name) < 2 or length(_full_name) > 120 then raise exception 'Please enter your full name'; end if;
  if _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(_email) > 255 then raise exception 'Please enter a valid email address'; end if;
  if length(_message) < 10 or length(_message) > 4000 then raise exception 'Message must be between 10 and 4000 characters'; end if;
  if _category not in ('Business Partnership','School Partnership','Sponsorship','Collaboration','Corporate Training','Institutional Collaboration','General Business Enquiry','General Enquiry','Payment Enquiry','Other') then raise exception 'Invalid category'; end if;
  if length(coalesce(_phone,'')) > 30 or length(coalesce(_organisation,'')) > 200 then raise exception 'Input too long'; end if;
  if (select count(*) from public.enquiries where email = _email and created_at > now() - interval '15 minutes') >= 3 then
    raise exception 'Too many messages. Please wait a few minutes and try again.';
  end if;
  if (select count(*) from public.enquiries where created_at > now() - interval '1 minute') >= 20 then
    raise exception 'The system is busy. Please try again shortly.';
  end if;
  insert into public.enquiries(source, full_name, email, phone, organisation, category, message, preferred_contact)
  values (coalesce(nullif(_source,''),'ceo'), _full_name, _email, nullif(trim(_phone),''), nullif(trim(_organisation),''), _category, _message, nullif(_preferred,''))
  returning reference into r;
  perform public.notify(case when _source='ceo' then 'ceo_message' else 'enquiry' end, case when _source='ceo' then 'New message to the CEO' else 'New business enquiry' end, _category||' from '||_full_name||' ('||r||')', '/admin/enquiries', 'enq-'||r);
  return r;
end $$;
grant execute on function public.submit_enquiry(text,text,text,text,text,text,text,text) to anon, authenticated;

-- ADMIN MANAGEMENT
create or replace function public.set_admin(_email text, _permissions public.admin_permission[])
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not public.has_role(auth.uid(),'super_admin') then raise exception 'Only the Super Administrator can manage administrators'; end if;
  select id into uid from public.profiles where lower(email) = lower(trim(_email));
  if uid is null then raise exception 'No registered account uses that email. Ask the person to register first.'; end if;
  if public.has_role(uid,'super_admin') then raise exception 'The Super Administrator already has full access'; end if;
  insert into public.user_roles(user_id, role) values (uid,'admin') on conflict do nothing;
  delete from public.admin_permissions where user_id = uid;
  insert into public.admin_permissions(user_id, permission) select uid, unnest(_permissions);
  perform public.write_audit('admin_set','user_roles',uid::text,null,jsonb_build_object('email',_email,'permissions',_permissions));
end $$;
revoke execute on function public.set_admin(text, public.admin_permission[]) from public, anon;
grant execute on function public.set_admin(text, public.admin_permission[]) to authenticated;

create or replace function public.remove_admin(_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'super_admin') then raise exception 'Only the Super Administrator can manage administrators'; end if;
  if public.has_role(_user_id,'super_admin') then raise exception 'The Super Administrator cannot be removed'; end if;
  delete from public.admin_permissions where user_id = _user_id;
  delete from public.user_roles where user_id = _user_id and role = 'admin';
  perform public.write_audit('admin_removed','user_roles',_user_id::text,null,null);
end $$;
revoke execute on function public.remove_admin(uuid) from public, anon;
grant execute on function public.remove_admin(uuid) to authenticated;

create or replace function public.list_admins()
returns table(user_id uuid, email text, full_name text, role public.app_role, permissions public.admin_permission[]) language sql stable security definer set search_path = public as $$
  select r.user_id, p.email, p.full_name, r.role, coalesce(array_agg(ap.permission) filter (where ap.permission is not null), '{}')
  from public.user_roles r join public.profiles p on p.id = r.user_id left join public.admin_permissions ap on ap.user_id = r.user_id
  where r.role in ('super_admin','admin') and public.has_role(auth.uid(),'super_admin')
  group by r.user_id, p.email, p.full_name, r.role
$$;
grant execute on function public.list_admins() to authenticated;

create or replace function public.my_access()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'super_admin', public.has_role(auth.uid(),'super_admin'),
    'admin', public.is_staff(auth.uid()),
    'permissions', coalesce((select jsonb_agg(permission) from public.admin_permissions where user_id = auth.uid()), '[]'::jsonb))
$$;
grant execute on function public.my_access() to authenticated;

-- STORAGE POLICIES
create policy "media public read" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "media staff insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "media staff update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "media staff delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "evidence own upload" on storage.objects for insert to authenticated with check (bucket_id = 'payment-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "evidence own or staff read" on storage.objects for select to authenticated using (bucket_id = 'payment-evidence' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_perm(auth.uid(),'payments')));
