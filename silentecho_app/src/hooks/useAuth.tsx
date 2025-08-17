'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthState, User } from '@/types';

export function useAuth() {
    const [auth, setAuth] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get<User>(`${process.env.NEXT_PUBLIC_GOSERVER_BASE_URL}/api/user/info`, {
                    withCredentials: true, // ensures cookie is sent
                });
                setAuth({ user: res.data, loading: false, error: null });
            } catch (err: any) {
                console.error('Failed to fetch user info:', err);
                setAuth({ user: null, loading: false, error: err.response?.data?.error || 'Unauthorized' });
            }
        };

        fetchUser();
    }, []);

    return auth; // { user, loading, error }
}
