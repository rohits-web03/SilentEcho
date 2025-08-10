"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

import { decryptNote } from '@/lib/utils';
import { NoteData } from '@/types/ApiResponse';

export default function Page() {
    const params = useParams();
    const slug = params?.slug as string | undefined;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
    const [password, setPassword] = useState<string>('');
    const [noteCiphertext, setNoteCiphertext] = useState<string | null>(null);

    // Extract Password from URL Hash (#) 
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            if (hash && hash.length > 1) {
                setPassword(hash.substring(1)); // Remove leading '#'
            }
        }
    }, [setPassword]);

    // Fetch Note Data when Slug is Available
    useEffect(() => {
        if (!slug) {
            setIsLoading(false);
            setError("Note identifier (slug) missing from URL.");
            return;
        }

        const fetchNote = async () => {
            setIsLoading(true);
            setError(null);
            setDecryptedContent(null);
            setNoteCiphertext(null);

            try {
                const apiUrl = `${process.env.NEXT_PUBLIC_GOSERVER_BASE_URL}/api/note/${slug}`;

                const response = await axios.get<NoteData>(apiUrl);

                if (response.data && response.data.ciphernote) {
                    setNoteCiphertext(response.data.ciphernote);
                } else {
                    setError("Fetched note data is incomplete (missing ciphertext).");
                    setIsLoading(false);
                }
            } catch (err: any) {
                console.error("Fetch error:", err);
                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 404) {
                        setError(`Note with slug "${slug}" not found.`);
                    } else {
                        setError(`Server error: ${err.response?.status || 'Unknown'} - Failed to fetch the note.`);
                    }
                } else {
                    setError("An unexpected error occurred while fetching the note.");
                }
                setIsLoading(false);
            }
        };

        fetchNote();
    }, [slug]);

    // Attempt Decryption When Ciphertext and Password are Ready
    const attemptDecryption = useCallback(async () => {
        if (!noteCiphertext) {
            if (!isLoading && !error) setError("Note data not available for decryption.");
            return;
        }

        if (!password) {
            setError("Password missing from URL fragment (e.g., add #yourPassword to the end of the URL).");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            //console.log("Attempting decryption..."); 
            const plaintext = await decryptNote(password, noteCiphertext);
            setDecryptedContent(plaintext);
            //console.log("Decryption successful.");
        } catch (decryptionError: any) {
            console.error("Decryption error:", decryptionError);
            setError("Decryption failed. The password might be incorrect or the note data could be corrupted.");
            setDecryptedContent(null);
        } finally {
            setIsLoading(false);
        }
    }, [noteCiphertext, password]);

    useEffect(() => {
        if (noteCiphertext && password && !error) {
            attemptDecryption();
        }
        else if (!isLoading && noteCiphertext && !password) {
            setError("Password missing from URL fragment (e.g., add #yourPassword to the end of the URL).");
        }

    }, [noteCiphertext, password, attemptDecryption, error, isLoading]);

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">View Encrypted Note</h1>
            {slug && <p className="mb-4 text-sm text-gray-500 break-all">Note Slug: {slug}</p>}

            {isLoading && (
                <div className="text-center py-10">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-600">Loading note data...</p>
                </div>
            )}

            {/* Display error message if fetching or decryption failed */}
            {error && !isLoading && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Display decrypted content on success */}
            {decryptedContent && !isLoading && !error && (
                <div className="mt-4 p-4 border rounded bg-gray-50 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Decrypted Content:</h2>
                    {/* Using 'whitespace-pre-wrap' to respect newlines and wrap long lines */}
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-white p-3 rounded border">
                        {decryptedContent}
                    </pre>
                </div>
            )}

            {/* if note loaded but needs password */}
            {!isLoading && !error && !decryptedContent && noteCiphertext && !password && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mt-4" role="alert">
                    <strong className="font-bold">Action Required: </strong>
                    <span className="block sm:inline">Please provide the password in the URL fragment (e.g., add #yourPassword to the end of the URL) to decrypt this note.</span>
                </div>
            )}
        </div>
    );
}