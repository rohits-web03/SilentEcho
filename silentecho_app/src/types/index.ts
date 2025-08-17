export interface User {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}
