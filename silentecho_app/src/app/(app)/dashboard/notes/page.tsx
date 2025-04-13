'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCcw, PlusCircle } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Note } from '@/model/Note';
import { ApiResponse, GoApiResponse } from '@/types/ApiResponse';
import { useSession } from 'next-auth/react';
import { User } from 'next-auth';
import { NoteCard } from '@/components/NoteCard';
import CreateNoteDialog from '@/components/CreateNoteDialog';

export default function CipherNotesDashboard() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const { toast } = useToast();

    const { data: session } = useSession();

    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<GoApiResponse>(`${process.env.NEXT_PUBLIC_GOSERVER_BASE_URL}/api/notes/user/${session?.user._id}`);
            const { data: apiData } = response;
            setNotes(apiData.data || []);
        } catch (error) {
            const axiosError = error as AxiosError<GoApiResponse>;
            toast({
                title: 'Error',
                description: axiosError.response?.data.message ?? 'Failed to fetch notes',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (!session || !session.user) return;
        fetchNotes();
    }, [session, fetchNotes]);

    const handleDeleteNote = (noteId: string) => {
        setNotes(notes.filter((note) => note._id !== noteId));
    };

    if (!session || !session.user) {
        return <div></div>;
    }

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold">Cipher Notes</h1>
                <Button onClick={() => setShowDialog(true)}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    New Note
                </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between mt-4">
                <p className="text-muted-foreground">
                    These are your encrypted notes. Share them with a password.
                </p>
                <Button variant="outline" onClick={fetchNotes}>
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCcw className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <NoteCard
                            key={note.slug}
                            note={note}
                            onDelete={handleDeleteNote}
                        />
                    ))
                ) : (
                    <p>No encrypted notes found.</p>
                )}
            </div>
            <CreateNoteDialog
                userId={session.user._id}
                open={showDialog}
                onOpenChange={setShowDialog}
                onNoteCreated={fetchNotes}
            />
        </div>
    );
}
