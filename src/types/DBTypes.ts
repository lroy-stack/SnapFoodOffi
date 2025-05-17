/**
 * Tipos para la estructura de la base de datos de Supabase
 * Types for the Supabase database structure
 */

export interface DBBewertung {
  id: string;
  benutzer_id: string;
  gericht_id: string;
  restaurant_id: string;
  gericht_restaurant_id?: string;
  bewertung: number;
  kommentar?: string;
  foto_url?: string;
  erstellt_am: string;
  aktualisiert_am: string;
}

export interface DBFoto {
  id: string;
  benutzer_id: string;
  gericht_id: string;
  restaurant_id: string;
  gericht_restaurant_id?: string;
  bewertung_id?: string;
  foto_url: string;
  beschreibung?: string;
  erstellt_am: string;
  aktualisiert_am: string;
}

export interface DBBenutzerProfil {
  id: string;
  user_id: string;
  benutzername: string;
  anzeigename?: string;
  profilbild_url?: string;
  bio?: string;
  sprache?: 'de' | 'en';
  erstellt_am: string;
  aktualisiert_am: string;
}

export interface DBGericht {
  id: string;
  name_de: string;
  name_en: string;
  beschreibung_de?: string;
  beschreibung_en?: string;
  kategorie: 'hauptgericht' | 'nachspeise' | 'vorspeise' | 'getränk' | 'snack';
  bild_url?: string;
  herkunft?: string;
  preisklasse?: 1 | 2 | 3;
  popularitaet?: number;
  erstellt_am: string;
  aktualisiert_am: string;
}

export interface DBRestaurant {
  id: string;
  name: string;
  adresse: string;
  bezirk: string;
  bewertung?: number;
  preisklasse?: 1 | 2 | 3;
  latitude?: number;
  longitude?: number;
  erstellt_am: string;
  aktualisiert_am: string;
}

export interface DBGerichtRestaurant {
  id: string;
  gericht_id: string;
  restaurant_id: string;
  preis?: number;
  verfuegbar: boolean;
  empfehlung?: boolean;
  erstellt_am: string;
  aktualisiert_am: string;
}

export interface DBUserStats {
  id: string;
  user_id: string;
  punkte: number;
  level: number;
  abzeichen_anzahl: number;
  bewertungen_anzahl: number;
  kommentare_anzahl: number;
  fotos_anzahl: number;
  besuchte_restaurants: number;
  besuchte_bezirke: number;
  probierte_gerichte: number;
  aktualisiert_am: string;
}

export interface DBAbzeichen {
  id: string;
  name_de: string;
  name_en: string;
  beschreibung_de: string;
  beschreibung_en: string;
  icon_url: string;
  kategorie: string;
  level_erforderlich: number;
  punkte_erforderlich: number;
  erstellt_am: string;
  aktualisiert_am: string;
}

export interface DBBenutzerAbzeichen {
  id: string;
  benutzer_id: string;
  abzeichen_id: string;
  erhalten_am: string;
}
