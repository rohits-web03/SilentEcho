export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface User {
    id: string; // uuid
    username: string;
    email: string;
    verifyCodeExpiry?: string; // ISO datetime string
    isVerified: boolean;
    isAcceptingMessages: boolean;
    createdAt: string; // ISO datetime string
    updatedAt: string; // ISO datetime string
}

export interface Message {
    id: string; // uuid
    userId: string; // uuid
    content: string;
    createdAt: string; // ISO datetime string
    // User relation excluded since backend sends only when populated
    user?: User;
}

export interface Note {
    id: string; // uuid
    slug: string;
    ciphernote: string; // matches `CipherNote`
    userId: string; // uuid
    createdAt: string; // ISO datetime string
    expiresAt?: string; // nullable datetime
    user?: User;
}

