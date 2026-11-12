// Netlify builds use the same site's /api; local React development uses Express.
const API = (process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8070')).replace(/\/$/, '');
export default API;
