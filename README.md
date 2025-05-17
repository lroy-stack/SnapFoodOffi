# SnapFoodOffi

SnapFoodOffi is an application that allows users to discover authentic Viennese cuisine, share photos, and interact with a community of food enthusiasts.

## Features

- **User Authentication**: Robust registration and login system with email verification, social logins, and magic links.
- **Profile Management**: User profiles with customizable usernames, display names, and profile pictures.
- **Multilingual Support**: Full support for German and English languages.
- **Interactive Map**: Explore restaurants on a map interface.
- **Dish Discovery**: Browse through authentic Viennese dishes with photos.
- **Gamification**: Level system, badges, and achievements for user engagement.
- **Responsive Design**: Built with a mobile-first approach using Tailwind CSS.

## Technical Overview

### Frontend
- React with TypeScript
- React Router for navigation
- Framer Motion for animations
- Tailwind CSS for styling
- i18next for internationalization

### Backend
- Supabase for authentication, database, and storage
- PostgreSQL database

## Authentication and Profile System

The application implements a robust authentication system with:

- Email and password authentication with verification
- Social login options (Google, Apple)
- Magic link authentication
- Automatic profile creation upon registration
- Fallback mechanisms for network issues
- Multi-layered profile loading with error handling

## Development

### Prerequisites
- Node.js
- npm or yarn
- Supabase account

### Setup
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Implemented Improvements

- Enhanced profile management with proper permission handling
- Bilingual logging and user feedback (German/English)
- Automatic profile creation during registration
- Recovery mechanisms for network issues
- Optimized authentication flow with better error handling
