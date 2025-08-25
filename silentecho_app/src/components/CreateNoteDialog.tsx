'use client';

import { useState } from 'react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { encryptNote } from '@/lib/utils';
import { Loader } from 'lucide-react';
import { goapi } from '@/lib/utils';

const expirationOptions = [
    { label: 'Never', value: '' },
    { label: '1 Hour', value: '1h' },
    { label: '1 Day', value: '1d' },
    { label: '1 Week', value: '7d' },
];

interface NotePayload {
    userId: string;
    ciphertext: string;
    expiresAt?: string;
}

export default function CreateNoteDialog({ userId, open, onOpenChange, onNoteCreated }: { userId: string; open: boolean; onOpenChange: (isOpen: boolean) => void; onNoteCreated?: () => void }) {
    const { toast } = useToast();
    const [content, setContent] = useState('');
    const [password, setPassword] = useState('');
    const [expiresIn, setExpiresIn] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!content || !password) {
            toast({ title: 'Missing Fields', description: 'Note and password are required.', variant: 'destructive' });
            return;
        }

        setLoading(true);

        try {
            const cipherText = await encryptNote(password, content);

            const payload: NotePayload = {
                userId,
                ciphertext: cipherText
            };

            // Calculate expiry time if needed
            if (expiresIn) {
                const now = new Date();
                const durationMap: Record<string, number> = {
                    '1h': 1,
                    '1d': 24,
                    '7d': 168,
                };
                const hours = durationMap[expiresIn];
                const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);
                payload.expiresAt = expiresAt.toISOString();
            }

            await goapi.post(`/api/notes/`, payload);

            toast({ title: 'Note Created', description: 'Encrypted note saved successfully.' });

            setContent('');
            setPassword('');
            setExpiresIn('');
            onOpenChange(false);
            onNoteCreated?.();

        } catch (err) {
            console.error("Failed to create note:", err);
            toast({ title: 'Error', description: 'Failed to create note. Please try again.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <div className='flex justify-between items-center'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>New Secure Note</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogCancel>
                        X
                    </AlertDialogCancel>
                </div>
                <div className="space-y-4">
                    <div>
                        <Label>Note</Label>
                        <Textarea
                            placeholder="Enter your message..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            placeholder="Encrypt with password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Expires In</Label>
                        <select
                            value={expiresIn}
                            onChange={(e) => setExpiresIn(e.target.value)}
                            className="w-full border rounded-md p-2"
                        >
                            {expirationOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button onClick={handleSubmit} disabled={loading} className="w-full">
                        {loading ? <Loader className="animate-spin h-4 w-4" /> : 'Save Note'}
                    </Button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
