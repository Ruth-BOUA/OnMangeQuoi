-- ============================================================
-- onMangeQuoi — schéma Supabase
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- Membres du foyer
create table members (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    avatar_color text not null default '#22C55E',
    created_at  timestamptz default now()
);

-- Plats
create table dishes (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    notes       text,
    photo_uri   text,
    created_at  timestamptz default now()
);

-- Portions cuisinées d'un plat (un plat peut avoir plusieurs lots)
create table meal_portions (
    id          uuid primary key default gen_random_uuid(),
    dish_id     uuid not null references dishes(id) on delete cascade,
    cooked_at   date not null default current_date,
    total_count integer not null check (total_count > 0),
    remaining   integer not null check (remaining >= 0),
    created_at  timestamptz default now()
);

-- Planning des repas (midi / soir, par membre, par jour)
create table meal_plans (
    id                uuid primary key default gen_random_uuid(),
    date              date not null,
    slot              text not null check (slot in ('lunch', 'dinner')),
    member_id         uuid not null references members(id) on delete cascade,
    dish_id           uuid not null references dishes(id) on delete cascade,
    meal_portion_id   uuid not null references meal_portions(id) on delete cascade,
    created_at        timestamptz default now(),
    unique (date, slot, member_id)
);

-- Listes de courses
create table shopping_lists (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    is_done     boolean not null default false,
    created_at  timestamptz default now()
);

-- Articles d'une liste de courses
create table shopping_items (
    id          uuid primary key default gen_random_uuid(),
    list_id     uuid not null references shopping_lists(id) on delete cascade,
    name        text not null,
    quantity    text,
    is_checked  boolean not null default false,
    created_at  timestamptz default now()
);

-- ============================================================
-- Pas d'auth → on désactive RLS sur toutes les tables
-- ============================================================
alter table members        disable row level security;
alter table dishes         disable row level security;
alter table meal_portions  disable row level security;
alter table meal_plans     disable row level security;
alter table shopping_lists disable row level security;
alter table shopping_items disable row level security;

-- ============================================================
-- Données initiales — les 2 membres du foyer
-- ============================================================
insert into members (name, avatar_color) values
    ('Ruth',      '#22C55E'),
    ('Elischama', '#3B82F6');
