-- Enable Vector Extension (For Phase 3 Vibe Search)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create Roles enum/checks directly using check constraints
-- Drop tables if they exist (for safe clean setup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.daily_tasks CASCADE;
DROP TABLE IF EXISTS public.availability CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.property_staff CASCADE;
DROP TABLE IF EXISTS public.property_staff_invites CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'owner', 'staff', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Properties Table
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    city_distance_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
    weekend_price NUMERIC(10,2) NOT NULL CHECK (weekend_price >= 0),
    deposit_percentage INTEGER NOT NULL DEFAULT 20 CHECK (deposit_percentage BETWEEN 10 AND 100),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
    bathrooms INTEGER NOT NULL CHECK (bathrooms >= 0),
    amenities TEXT[] NOT NULL DEFAULT '{}'::text[],
    activities TEXT[] NOT NULL DEFAULT '{}'::text[],
    rules TEXT[] NOT NULL DEFAULT '{}'::text[],
    images TEXT[] NOT NULL DEFAULT '{}'::text[],
    videos TEXT[] NOT NULL DEFAULT '{}'::text[],
    documents TEXT[] NOT NULL DEFAULT '{}'::text[],
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Property Staff Invites Table
CREATE TABLE public.property_staff_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invite_email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    is_used BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Property Staff Mapping Table
CREATE TABLE public.property_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (property_id, staff_id)
);

-- 5. Bookings Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'cancelled')),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    deposit_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (deposit_paid >= 0),
    remaining_balance NUMERIC(10,2) NOT NULL CHECK (remaining_balance >= 0),
    invoice_pdf_url TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    payment_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (start_date < end_date)
);

-- 6. Availability Table
CREATE TABLE public.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    blocked_date DATE NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('booked', 'payment_hold', 'maintenance', 'owner_use')),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (property_id, blocked_date)
);

-- 7. Daily Tasks Table
CREATE TABLE public.daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Inquiries Table
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    message TEXT NOT NULL,
    dates_interested JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'responded', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Reviews Table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}'::text[],
    videos TEXT[] NOT NULL DEFAULT '{}'::text[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance & search
CREATE INDEX idx_properties_slug ON public.properties(slug);
CREATE INDEX idx_availability_date ON public.availability(blocked_date);
CREATE INDEX idx_bookings_dates ON public.bookings(start_date, end_date);
CREATE INDEX idx_property_staff_ids ON public.property_staff(property_id, staff_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_staff_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Auth Sync Trigger: Automatically insert profile when user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Guest'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'customer')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- PROFILE POLICIES
CREATE POLICY "Public Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile columns" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- PROPERTIES POLICIES
CREATE POLICY "Anyone can view published properties" ON public.properties
    FOR SELECT USING (is_published = true OR auth.uid() = owner_id OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')));

CREATE POLICY "Owners can insert properties" ON public.properties
    FOR INSERT WITH CHECK (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'));

CREATE POLICY "Owners can update their own properties" ON public.properties
    FOR UPDATE USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Owners can delete their own properties" ON public.properties
    FOR DELETE USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- BOOKINGS POLICIES
CREATE POLICY "Users can view their own bookings or owned properties bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() = customer_id 
        OR auth.uid() = (SELECT owner_id FROM public.properties WHERE id = property_id)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        OR EXISTS (SELECT 1 FROM public.property_staff WHERE property_id = bookings.property_id AND staff_id = auth.uid())
    );

CREATE POLICY "Customers can insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Booking status can be updated by customer or owner" ON public.bookings
    FOR UPDATE USING (
        auth.uid() = customer_id 
        OR auth.uid() = (SELECT owner_id FROM public.properties WHERE id = property_id)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- AVAILABILITY POLICIES
CREATE POLICY "Anyone can view availability records" ON public.availability
    FOR SELECT USING (true);

CREATE POLICY "Owners and Admins can write availability" ON public.availability
    FOR ALL USING (
        auth.uid() = (SELECT owner_id FROM public.properties WHERE id = property_id)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- INQUIRIES POLICIES
CREATE POLICY "Inquiries viewable by customer, owner, or staff" ON public.inquiries
    FOR SELECT USING (
        auth.uid() = customer_id
        OR auth.uid() = (SELECT owner_id FROM public.properties WHERE id = property_id)
        OR EXISTS (SELECT 1 FROM public.property_staff WHERE property_id = inquiries.property_id AND staff_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Anyone can submit inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (true);

-- REVIEWS POLICIES
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Customers who finished booking can review" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = customer_id 
        AND EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE id = booking_id 
            AND customer_id = auth.uid() 
            AND status = 'confirmed'
        )
    );
