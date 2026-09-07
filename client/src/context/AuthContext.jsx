import { createContext, useContext, useState } from 'react';
import api from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) { const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('novacart_user') || 'null')); const save = (data) => { localStorage.setItem('novacart_token', data.token); localStorage.setItem('novacart_user', JSON.stringify(data.user)); setUser(data.user); }; const login = async (payload) => save((await api.post('/auth/login', payload)).data.data); const register = async (payload) => save((await api.post('/auth/register', payload)).data.data); const logout = () => { localStorage.removeItem('novacart_token'); localStorage.removeItem('novacart_user'); setUser(null); }; return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>; }
export const useAuth = () => useContext(AuthContext);
