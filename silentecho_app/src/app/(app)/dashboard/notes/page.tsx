'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Loader2, PlusCircle, RefreshCcw } from 'lucide-react';
import { AxiosError } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Note } from '@/types';
import { ApiResponse } from '@/types/ApiResponse';
import { useAuth } from '@/hooks/useAuth';
import { NoteCard } from '@/components/NoteCard';
import CreateNoteDialog from '@/components/CreateNoteDialog';
import { motion } from 'framer-motion';
import { goapi } from '@/lib/utils';

export default function CipherNotesDashboard() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const { toast } = useToast();

    const { user } = useAuth();

    const fetchNotes = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const response = await goapi.get<ApiResponse<Note[]>>(`/api/notes/user/${user.id}`);
            const { data: apiData } = response;
            // console.log(apiData);
            setNotes(apiData.data || []);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse<unknown>>;
            toast({
                title: 'Error',
                description: axiosError.response?.data.message ?? 'Failed to fetch notes',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast, user]);

    useEffect(() => {
        if (!user) return;
        fetchNotes();
    }, [fetchNotes, user]);

    const handleDeleteNote = (noteId: string) => {
        setNotes(notes.filter((note) => note.id !== noteId));
    };

    if (!user) {
        return <div></div>;
    }

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cipher Notes</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchNotes}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <RefreshCcw className="h-4 w-4 mr-2" />
                        )}
                        Refresh
                    </Button>

                    <Button
                        onClick={() => setShowDialog(true)}
                        size="sm"
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Note
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {notes.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {notes.map((note, index) => (
                            <motion.div
                                key={note.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <NoteCard
                                    note={note}
                                    onDelete={handleDeleteNote}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded-full mb-4">
                                <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No notes yet</h3>
                            <p className="text-sm text-muted-foreground max-w-md mb-4">
                                Create your first encrypted note to get started
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <CreateNoteDialog
                userId={user.id}
                open={showDialog}
                onOpenChange={setShowDialog}
                onNoteCreated={fetchNotes}
            />
        </div>
    );
}
