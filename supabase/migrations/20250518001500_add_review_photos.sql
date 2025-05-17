-- Migration: Add support for review photos in bewertungen table
-- Created: 2025-05-18

-- Create fotos bucket if it doesn't exist
-- Note: This is a comment as Supabase migrations don't support bucket creation directly
-- You'll need to create the bucket 'fotos' in the Supabase dashboard if it doesn't exist

-- Make sure the bewertungen table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bewertungen') THEN
        CREATE TABLE public.bewertungen (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            benutzer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            gericht_id TEXT NOT NULL,
            restaurant_id TEXT NOT NULL,
            bewertung INTEGER NOT NULL CHECK (bewertung BETWEEN 1 AND 5),
            kommentar TEXT,
            erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            aktualisiert_am TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies for bewertungen
        ALTER TABLE public.bewertungen ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Anyone can view bewertungen" ON public.bewertungen
            FOR SELECT USING (true);

        CREATE POLICY "Users can insert their own bewertungen" ON public.bewertungen
            FOR INSERT WITH CHECK (auth.uid() = benutzer_id);

        CREATE POLICY "Users can update their own bewertungen" ON public.bewertungen
            FOR UPDATE USING (auth.uid() = benutzer_id);

        CREATE POLICY "Users can delete their own bewertungen" ON public.bewertungen
            FOR DELETE USING (auth.uid() = benutzer_id);
    END IF;
END
$$;

-- Add foto_url column to bewertungen if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'bewertungen'
        AND column_name = 'foto_url'
    ) THEN
        ALTER TABLE public.bewertungen ADD COLUMN foto_url TEXT;
    END IF;
END
$$;

-- Create separate fotos table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fotos') THEN
        CREATE TABLE public.fotos (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            benutzer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            gericht_id TEXT NOT NULL,
            restaurant_id TEXT NOT NULL,
            bewertung_id UUID REFERENCES public.bewertungen(id) ON DELETE SET NULL,
            foto_url TEXT NOT NULL,
            beschreibung TEXT,
            erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            aktualisiert_am TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies for fotos
        ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Anyone can view fotos" ON public.fotos
            FOR SELECT USING (true);

        CREATE POLICY "Users can insert their own fotos" ON public.fotos
            FOR INSERT WITH CHECK (auth.uid() = benutzer_id);

        CREATE POLICY "Users can update their own fotos" ON public.fotos
            FOR UPDATE USING (auth.uid() = benutzer_id);

        CREATE POLICY "Users can delete their own fotos" ON public.fotos
            FOR DELETE USING (auth.uid() = benutzer_id);
    END IF;
END
$$;

-- Create function to link bewertungen and fotos
CREATE OR REPLACE FUNCTION public.link_review_photo()
RETURNS TRIGGER AS $$
BEGIN
    -- If a photo is uploaded with a review, link them
    IF NEW.foto_url IS NOT NULL THEN
        -- Insert into fotos table
        INSERT INTO public.fotos (benutzer_id, gericht_id, restaurant_id, bewertung_id, foto_url)
        VALUES (NEW.benutzer_id, NEW.gericht_id, NEW.restaurant_id, NEW.id, NEW.foto_url);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'link_review_photo_trigger'
    ) THEN
        CREATE TRIGGER link_review_photo_trigger
        AFTER INSERT ON public.bewertungen
        FOR EACH ROW
        EXECUTE FUNCTION public.link_review_photo();
    END IF;
END
$$;
