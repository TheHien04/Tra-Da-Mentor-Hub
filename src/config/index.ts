// Configuration based on environment
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
  },
  app: {
    name: 'Trà Dá Mentor',
    version: '1.0.0',
  },
  environment: import.meta.env.MODE,
};

export default config;
