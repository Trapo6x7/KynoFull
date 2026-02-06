// Configuration de l'API DogWalk

// En développement, utiliser l'IP locale de la machine
// Pour Android Emulator: 10.0.2.2
// Pour iOS Simulator: localhost
// Pour appareil physique: IP de la machine sur le réseau local

// const DEV_API_URL = 'http://10.0.2.2:8000'; // Pour Android Emulator
// const DEV_API_URL = 'http://localhost:8000'; // Pour iOS Simulator
const DEV_API_URL = 'http://192.168.1.248:8000'; // Pour appareil physique

const PROD_API_URL = 'https://api.dogwalk.com'; // URL de production

export const API_CONFIG = {
  BASE_URL: __DEV__ ? DEV_API_URL : PROD_API_URL,
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/login_check',
    REGISTER: '/api/register',
    ME: '/api/me',
    LOGOUT: '/api/logout',
    
    // Users
    USERS: '/api/users',
    USER_UPDATE_PASSWORD: '/api/users/updatepassword',
    USER_IMAGE: '/api/users/image',
    
    // Dogs
    DOGS: '/api/dogs',
    
    // Walks
    WALKS: '/api/walks',
    
    // Groups
    GROUPS: '/api/groups',
    GROUP_REQUESTS: '/api/group_requests',
    
    // Reviews
    REVIEWS: '/api/reviews',
    
    // Races
    RACES: '/api/races',
    
    // Keywords
    KEYWORDS: '/api/keywords',
    
    // Matches
    USER_MATCHES: '/api/user_matches',
  },
  TIMEOUT: 30000, // 30 secondes
};

export default API_CONFIG;
