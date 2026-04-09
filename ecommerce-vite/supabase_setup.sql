-- Drop existing policies first (safe to re-run)
DROP POLICY IF EXISTS "Products are public" ON public.products;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Reviews are public" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
-- =============================================
-- OBSIDIAN FORGE — Supabase Database Setup
-- Run this in: Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Products table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  category text,
  stock int default 100,
  rating decimal(3,2) default 4.5,
  specs jsonb,
  created_at timestamptz default now()
);

-- 2. Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  bio text,
  avatar_url text,
  updated_at timestamptz default now()
);

-- 3. Orders
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  total decimal(10,2),
  status text default 'confirmed',
  shipping_address text,
  created_at timestamptz default now()
);

-- 4. Order Items
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity int not null,
  price_at_purchase decimal(10,2) not null
);

-- 5. Reviews
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  rating int check (rating between 1 and 5),
  body text,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- Products: anyone can read
create policy "Products are public" on public.products for select using (true);

-- Profiles: users can read/update own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Orders: users can read/create own orders
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);

-- Order items: users can read items for their own orders
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Users can create order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Reviews: anyone can read, users can create
create policy "Reviews are public" on public.reviews for select using (true);
create policy "Users can create reviews" on public.reviews for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- SEED PRODUCTS (12 items)
-- =============================================
insert into public.products (name, description, price, image_url, category, stock, rating, specs) values
  ('Obsidian Pro Keyboard', 'The pinnacle of mechanical keyboard engineering. Ultra-low latency switches rated for 100M keystrokes. Anodized aluminum chassis.', 299.00, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&q=80', 'Peripherals', 50, 4.8, '{"Switch":"Obsidian Linear v3","Layout":"TKL 87-key","Interface":"USB-C","Latency":"<0.5ms"}'),
  ('Forge Display 27"', '4K OLED at 144Hz refresh rate with 0.1ms response, HDR1000, 99% DCI-P3 color coverage.', 899.00, 'https://images.unsplash.com/photo-1527443224154-c4a573d5f5a8?w=600&q=80', 'Monitors', 20, 4.9, '{"Resolution":"3840x2160","Refresh":"144Hz","Panel":"OLED","Response":"0.1ms"}'),
  ('Obsidian Mouse X1', 'Precision optical sensor at 25,600 DPI. Ambidextrous design with 7 programmable buttons.', 149.00, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80', 'Peripherals', 100, 4.7, '{"DPI":"Up to 25600","Buttons":"7","Polling":"8000Hz","Weight":"58g"}'),
  ('Forge Audio Pro', 'Studio-grade open-back headphones, 40mm planar magnetic drivers, 20Hz-40kHz frequency response.', 449.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', 'Audio', 35, 4.6, '{"Drivers":"40mm Planar","Freq":"20Hz-40kHz","Impedance":"70Ω","Cable":"Detachable 4.4mm"}'),
  ('Obsidian Hub 7-Port', '7-port USB-C hub with 10Gbps data, 100W PD, 4K HDMI, SD card reader.', 129.00, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 'Hardware', 80, 4.5, '{"USB Ports":"7","Speed":"10Gbps","Power":"100W PD","Video":"4K@60Hz HDMI"}'),
  ('Forge Webcam 4K', '4K 30fps webcam with AI autofocus, noise-canceling dual mics, and HDR in low light.', 349.00, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80', 'Hardware', 40, 4.7, '{"Resolution":"4K 30fps","Autofocus":"AI-powered","Microphones":"2x NC","FOV":"90°"}'),
  ('Shadow Desk Mat XL', 'Extra-large 900x400mm desk mat, micro-textured surface for pixel-precise mouse control.', 79.00, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80', 'Peripherals', 200, 4.4, '{"Size":"900x400mm","Thickness":"4mm","Surface":"Micro-textured","Base":"Non-slip rubber"}'),
  ('Obsidian SSD 2TB', 'PCIe 5.0 NVMe SSD with 14,500 MB/s read, 12,000 MB/s write. M.2 2280 form factor.', 219.00, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80', 'Hardware', 60, 4.9, '{"Capacity":"2TB","Read":"14500 MB/s","Write":"12000 MB/s","Form":"M.2 2280 PCIe 5.0"}'),
  ('Forge Software Suite', 'Annual license for Forge IDE, system monitoring, and developer toolkit bundle.', 199.00, 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80', 'Software', 999, 4.6, '{"License":"Annual","Devices":"Up to 3","Updates":"Lifetime","Support":"Priority"}'),
  ('Obsidian Arm Mount', 'Single monitor arm with full articulation, cable management, VESA 75/100 compatible, up to 32".', 169.00, 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80', 'Hardware', 45, 4.5, '{"VESA":"75/100mm","Max Size":"32\"","Load":"Up to 10kg","Adjustment":"360° rotation"}'),
  ('Forge LED Strip Kit', 'Addressable RGB strips, 5m, 144 LEDs/m, compatible with Forge software ecosystem.', 59.00, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&q=80', 'Hardware', 150, 4.3, '{"Length":"5m","Density":"144 LEDs/m","Addressable":"Yes","Power":"24V DC"}'),
  ('Obsidian Cable Kit', 'Modular sleeved cable kit for PSU, 24-pin ATX + 8-pin CPU + PCIe, all black paracord.', 39.00, 'https://images.unsplash.com/photo-1601592498540-fb78c0d24e63?w=600&q=80', 'Peripherals', 300, 4.2, '{"Material":"Paracord","Includes":"24-pin + 8-pin + PCIe","Length":"600mm","Color":"Obsidian Black"}');
