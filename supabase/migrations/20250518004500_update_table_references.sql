-- Migration: Actualizar referencias de tablas para mayor coherencia
-- Created: 2025-05-18

-- Verificar y actualizar referencias en la tabla bewertungen
DO $$
BEGIN
    -- Comprobar si existe la columna gericht_id y necesita ser actualizada
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'bewertungen'
        AND column_name = 'gericht_id'
        AND data_type = 'text'
    ) THEN
        -- Comprobar si existe la tabla gerichte
        IF EXISTS (
            SELECT 1
            FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = 'gerichte'
        ) THEN
            -- Intentar actualizar la referencia si es posible
            BEGIN
                ALTER TABLE public.bewertungen 
                DROP CONSTRAINT IF EXISTS bewertungen_gericht_id_fkey;
                
                ALTER TABLE public.bewertungen 
                ADD CONSTRAINT bewertungen_gericht_id_fkey 
                FOREIGN KEY (gericht_id) 
                REFERENCES public.gerichte(id) ON DELETE CASCADE;
                
                RAISE NOTICE 'Referencia gericht_id actualizada a foreign key';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'No se pudo actualizar la referencia gericht_id: %', SQLERRM;
            END;
        END IF;
    END IF;

    -- Comprobar si existe la columna restaurant_id y necesita ser actualizada
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'bewertungen'
        AND column_name = 'restaurant_id'
        AND data_type = 'text'
    ) THEN
        -- Comprobar si existe la tabla restaurants
        IF EXISTS (
            SELECT 1
            FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = 'restaurants'
        ) THEN
            -- Intentar actualizar la referencia si es posible
            BEGIN
                ALTER TABLE public.bewertungen 
                DROP CONSTRAINT IF EXISTS bewertungen_restaurant_id_fkey;
                
                ALTER TABLE public.bewertungen 
                ADD CONSTRAINT bewertungen_restaurant_id_fkey 
                FOREIGN KEY (restaurant_id) 
                REFERENCES public.restaurants(id) ON DELETE CASCADE;
                
                RAISE NOTICE 'Referencia restaurant_id actualizada a foreign key';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'No se pudo actualizar la referencia restaurant_id: %', SQLERRM;
            END;
        END IF;
    END IF;
    
    -- Comprobar si existe la tabla gericht_restaurant
    IF EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'gericht_restaurant'
    ) THEN
        -- Comprobar si se puede añadir una columna gericht_restaurant_id
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'bewertungen'
            AND column_name = 'gericht_restaurant_id'
        ) THEN
            BEGIN
                -- Añadir columna gericht_restaurant_id
                ALTER TABLE public.bewertungen 
                ADD COLUMN gericht_restaurant_id UUID;
                
                -- Añadir foreign key
                ALTER TABLE public.bewertungen 
                ADD CONSTRAINT bewertungen_gericht_restaurant_id_fkey 
                FOREIGN KEY (gericht_restaurant_id) 
                REFERENCES public.gericht_restaurant(id) ON DELETE SET NULL;
                
                RAISE NOTICE 'Columna gericht_restaurant_id añadida a bewertungen';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'No se pudo añadir la columna gericht_restaurant_id: %', SQLERRM;
            END;
        END IF;
    END IF;
END
$$;

-- Actualizar la tabla fotos de manera similar
DO $$
BEGIN
    -- Comprobar si existe la columna gericht_id y necesita ser actualizada
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'fotos'
        AND column_name = 'gericht_id'
        AND data_type = 'text'
    ) THEN
        -- Comprobar si existe la tabla gerichte
        IF EXISTS (
            SELECT 1
            FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = 'gerichte'
        ) THEN
            -- Intentar actualizar la referencia si es posible
            BEGIN
                ALTER TABLE public.fotos 
                DROP CONSTRAINT IF EXISTS fotos_gericht_id_fkey;
                
                ALTER TABLE public.fotos 
                ADD CONSTRAINT fotos_gericht_id_fkey 
                FOREIGN KEY (gericht_id) 
                REFERENCES public.gerichte(id) ON DELETE CASCADE;
                
                RAISE NOTICE 'Referencia gericht_id actualizada a foreign key en fotos';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'No se pudo actualizar la referencia gericht_id en fotos: %', SQLERRM;
            END;
        END IF;
    END IF;

    -- Comprobar si existe la columna restaurant_id y necesita ser actualizada
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'fotos'
        AND column_name = 'restaurant_id'
        AND data_type = 'text'
    ) THEN
        -- Comprobar si existe la tabla restaurants
        IF EXISTS (
            SELECT 1
            FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = 'restaurants'
        ) THEN
            -- Intentar actualizar la referencia si es posible
            BEGIN
                ALTER TABLE public.fotos 
                DROP CONSTRAINT IF EXISTS fotos_restaurant_id_fkey;
                
                ALTER TABLE public.fotos 
                ADD CONSTRAINT fotos_restaurant_id_fkey 
                FOREIGN KEY (restaurant_id) 
                REFERENCES public.restaurants(id) ON DELETE CASCADE;
                
                RAISE NOTICE 'Referencia restaurant_id actualizada a foreign key en fotos';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'No se pudo actualizar la referencia restaurant_id en fotos: %', SQLERRM;
            END;
        END IF;
    END IF;
    
    -- Comprobar si existe la tabla gericht_restaurant
    IF EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'gericht_restaurant'
    ) THEN
        -- Comprobar si se puede añadir una columna gericht_restaurant_id
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'fotos'
            AND column_name = 'gericht_restaurant_id'
        ) THEN
            BEGIN
                -- Añadir columna gericht_restaurant_id
                ALTER TABLE public.fotos 
                ADD COLUMN gericht_restaurant_id UUID;
                
                -- Añadir foreign key
                ALTER TABLE public.fotos 
                ADD CONSTRAINT fotos_gericht_restaurant_id_fkey 
                FOREIGN KEY (gericht_restaurant_id) 
                REFERENCES public.gericht_restaurant(id) ON DELETE SET NULL;
                
                RAISE NOTICE 'Columna gericht_restaurant_id añadida a fotos';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'No se pudo añadir la columna gericht_restaurant_id a fotos: %', SQLERRM;
            END;
        END IF;
    END IF;
END
$$;

-- Crear índices para mejorar el rendimiento de las consultas
DO $$
BEGIN
    -- Crear índice en bewertungen.benutzer_id si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'bewertungen'
        AND indexname = 'idx_bewertungen_benutzer_id'
    ) THEN
        CREATE INDEX idx_bewertungen_benutzer_id ON public.bewertungen(benutzer_id);
    END IF;
    
    -- Crear índice en bewertungen.gericht_id si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'bewertungen'
        AND indexname = 'idx_bewertungen_gericht_id'
    ) THEN
        CREATE INDEX idx_bewertungen_gericht_id ON public.bewertungen(gericht_id);
    END IF;
    
    -- Crear índice en bewertungen.restaurant_id si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'bewertungen'
        AND indexname = 'idx_bewertungen_restaurant_id'
    ) THEN
        CREATE INDEX idx_bewertungen_restaurant_id ON public.bewertungen(restaurant_id);
    END IF;
    
    -- Crear índice en fotos.benutzer_id si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'fotos'
        AND indexname = 'idx_fotos_benutzer_id'
    ) THEN
        CREATE INDEX idx_fotos_benutzer_id ON public.fotos(benutzer_id);
    END IF;
    
    -- Crear índice en fotos.bewertung_id si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'fotos'
        AND indexname = 'idx_fotos_bewertung_id'
    ) THEN
        CREATE INDEX idx_fotos_bewertung_id ON public.fotos(bewertung_id);
    END IF;
    
    -- Crear índice en fotos.gericht_id si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'fotos'
        AND indexname = 'idx_fotos_gericht_id'
    ) THEN
        CREATE INDEX idx_fotos_gericht_id ON public.fotos(gericht_id);
    END IF;
END
$$;

-- Añadir función para mantener actualizadas las relaciones automáticamente
CREATE OR REPLACE FUNCTION public.update_gericht_restaurant_references()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actualizar si tenemos tanto gericht_id como restaurant_id
    IF NEW.gericht_id IS NOT NULL AND NEW.restaurant_id IS NOT NULL THEN
        -- Intentar encontrar o crear la relación gericht_restaurant
        DECLARE
            relation_id UUID;
        BEGIN
            -- Buscar si existe una relación
            SELECT id INTO relation_id
            FROM public.gericht_restaurant
            WHERE gericht_id = NEW.gericht_id
            AND restaurant_id = NEW.restaurant_id
            LIMIT 1;
            
            -- Si no existe, intentar crearla
            IF relation_id IS NULL THEN
                -- Solo si la tabla existe
                IF EXISTS (
                    SELECT 1
                    FROM pg_tables
                    WHERE schemaname = 'public'
                    AND tablename = 'gericht_restaurant'
                ) THEN
                    -- Insertar y recuperar el ID
                    INSERT INTO public.gericht_restaurant (gericht_id, restaurant_id)
                    VALUES (NEW.gericht_id, NEW.restaurant_id)
                    RETURNING id INTO relation_id;
                END IF;
            END IF;
            
            -- Actualizar el vínculo en la tabla correspondiente
            IF relation_id IS NOT NULL THEN
                NEW.gericht_restaurant_id := relation_id;
            END IF;
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear triggers para mantener actualizados los IDs de gericht_restaurant
DO $$
BEGIN
    -- Para la tabla bewertungen
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'bewertungen'
        AND column_name = 'gericht_restaurant_id'
    ) THEN
        -- Eliminar el trigger si ya existe
        DROP TRIGGER IF EXISTS update_bewertungen_gericht_restaurant_id ON public.bewertungen;
        
        -- Crear el trigger
        CREATE TRIGGER update_bewertungen_gericht_restaurant_id
        BEFORE INSERT OR UPDATE OF gericht_id, restaurant_id ON public.bewertungen
        FOR EACH ROW
        EXECUTE FUNCTION public.update_gericht_restaurant_references();
    END IF;
    
    -- Para la tabla fotos
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'fotos'
        AND column_name = 'gericht_restaurant_id'
    ) THEN
        -- Eliminar el trigger si ya existe
        DROP TRIGGER IF EXISTS update_fotos_gericht_restaurant_id ON public.fotos;
        
        -- Crear el trigger
        CREATE TRIGGER update_fotos_gericht_restaurant_id
        BEFORE INSERT OR UPDATE OF gericht_id, restaurant_id ON public.fotos
        FOR EACH ROW
        EXECUTE FUNCTION public.update_gericht_restaurant_references();
    END IF;
END
$$;
