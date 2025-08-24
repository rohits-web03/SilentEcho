'use client';

import { useState, useEffect } from 'react';
import { AuthState, User } from '@/types';
import { goapi } from '@/lib/utils';

export function useAuth() {
    const [auth, setAuth] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await goapi.get<User>(`/api/user/info`);
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
