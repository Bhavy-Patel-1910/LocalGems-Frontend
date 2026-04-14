import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import API from '../api/axios';   // ✅ FIXED IMPORT

const AuthContext = createContext(null);

const initialState = {
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        loading: false,
      };

    case 'LOGOUT':
      return { user: null, accessToken: null, loading: false };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 🔹 Get current user
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        return dispatch({ type: 'SET_LOADING', payload: false });
      }

      try {
        const { data } = await API.get('/auth/me');
        dispatch({ type: 'SET_USER', payload: data.data.user });
      } catch (err) {
        localStorage.clear();
        dispatch({ type: 'LOGOUT' });
      }
    };

    init();
  }, []);

  // 🔹 Login
  const login = useCallback(async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });

    const { user, accessToken, refreshToken } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    dispatch({
      type: 'LOGIN',
      payload: { user, accessToken },
    });

    return user;
  }, []);

  // 🔹 Register
  const register = useCallback(async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    return data;
  }, []);

  // 🔹 Logout
  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } catch {}

    localStorage.clear();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((user) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
