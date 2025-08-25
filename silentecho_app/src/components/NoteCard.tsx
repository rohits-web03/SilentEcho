'use client';

import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash, Link as LinkIcon, Clock } from 'lucide-react';
import axios from 'axios';
import { useToast } from './ui/use-toast';

interface NoteCardProps {
    note: Note;
    onDelete: (noteId: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
    const { toast } = useToast();

    const shareUrl = `${window.location.origin}/view/${note.slug}`;

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast({
            title: 'Link Copied!',
            description: 'Shareable link copied to clipboard.',
        });
    };

    const handleDelete = async () => {
        console.log("Deleting Note...");
        onDelete(note.id);
        // try {
        //     await axios.delete(`/api/notes/${note.slug}`);
        //     toast({
        //         title: 'Note Deleted',
        //         description: 'The note has been removed.',
        //     });
        //     onDelete(note._id);
        // } catch (err) {
        //     toast({
        //         title: 'Error',
        //         description: 'Failed to delete note.',
        //         variant: 'destructive',
        //     });
        // }
    };

    return (
        <Card className="p-4">
            <CardContent className="space-y-3">
                <p className="text-muted-foreground break-all">
                    <span className="font-medium">Cipher:</span> {note.ciphernote.slice(0, 100)}...
                </p>

                {note.expiresAt && (
                    <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        Expires at: {new Date(note.expiresAt).toLocaleString()}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button size="sm" onClick={copyLink}>
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Copy Link
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleDelete}>
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
