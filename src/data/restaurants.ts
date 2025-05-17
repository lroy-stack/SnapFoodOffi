import { Restaurant } from '../types';

// Sample restaurant data
export const restaurants: Restaurant[] = [
  {
    id: 'figlmueller',
    name: 'Figlmüller',
    address: 'Wollzeile 5, 1010 Wien',
    district: '1. Bezirk',
    rating: 4.8,
    priceRange: 2,
    coordinates: {
      lat: 48.2081,
      lng: 16.3748
    },
    dishes: ['wiener-schnitzel', 'apfelstrudel']
  },
  {
    id: 'plachutta',
    name: 'Plachutta',
    address: 'Wollzeile 38, 1010 Wien',
    district: '1. Bezirk',
    rating: 4.7,
    priceRange: 3,
    coordinates: {
      lat: 48.2091,
      lng: 16.3786
    },
    dishes: ['tafelspitz', 'wiener-gulasch']
  },
  {
    id: 'cafe-central',
    name: 'Café Central',
    address: 'Herrengasse 14, 1010 Wien',
    district: '1. Bezirk',
    rating: 4.6,
    priceRange: 2,
    coordinates: {
      lat: 48.2099,
      lng: 16.3667
    },
    dishes: ['sachertorte', 'melange']
  },
  {
    id: 'gasthaus-mayer',
    name: 'Gasthaus Mayer',
    address: 'Wiedner Hauptstraße 137, 1050 Wien',
    district: '5. Bezirk',
    rating: 4.5,
    priceRange: 2,
    coordinates: {
      lat: 48.1872,
      lng: 16.3627
    },
    dishes: ['wiener-schnitzel', 'gulasch']
  },
  {
    id: 'cafe-sacher',
    name: 'Café Sacher',
    address: 'Philharmoniker Str. 4, 1010 Wien',
    district: '1. Bezirk',
    rating: 4.5,
    priceRange: 3,
    coordinates: {
      lat: 48.2038,
      lng: 16.3686
    },
    dishes: ['sachertorte', 'melange']
  }
];

export default restaurants;