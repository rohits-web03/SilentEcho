'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/types';
import { ApiResponse, acceptMessagesStatus } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Copy, Loader2, MailQuestion, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { goapi } from '@/lib/utils';

function UserMessagesDashboard() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState(false);

    const { toast } = useToast();

    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((message) => message.id !== messageId));
    };

    const { user } = useAuth();

    const form = useForm({
        resolver: zodResolver(acceptMessageSchema),
    });

    const { register, watch, setValue } = form;
    const acceptMessages = watch('acceptMessages');

    const fetchAcceptMessages = useCallback(async () => {
        if (!user) return;
        setIsSwitchLoading(true);
        try {
            const response = await goapi.get<ApiResponse<acceptMessagesStatus>>(`/api/user/${user?.id}/accept-messages`);
            setValue('acceptMessages', response.data.data?.isAcceptingMessages);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse<unknown>>;
            toast({
                title: 'Error',
                description:
                    axiosError.response?.data.message ??
                    'Failed to fetch message settings',
                variant: 'destructive',
            });
        } finally {
            setIsSwitchLoading(false);
        }
    }, [setValue, toast, user]);

    const fetchMessages = useCallback(
        async (refresh: boolean = false) => {
            setIsLoading(true);
            setIsSwitchLoading(false);
            try {
                const response = await goapi.get<ApiResponse<Message[]>>(`/api/messages/`);
                setMessages(response.data.data || []);
                if (refresh) {
                    toast({
                        title: 'Refreshed Messages',
                        description: 'Showing latest messages',
                    });
                }
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse<unknown>>;
                toast({
                    title: 'Error',
                    description:
                        axiosError.response?.data.message ?? 'Failed to fetch messages',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
                setIsSwitchLoading(false);
            }
        },
        [setMessages, toast]
    );

    // Fetch initial state from the server
    useEffect(() => {
        if (!user) return;
        // console.log("Loading messages for user:", user);

        fetchMessages();

        fetchAcceptMessages();
    }, [user, fetchAcceptMessages, fetchMessages]);

    // Handle switch change
    const handleSwitchChange = async () => {
        try {
            const response = await goapi.patch<ApiResponse<void>>(`/api/user/${user?.id}/accept-messages`, {
                isAcceptingMessages: !acceptMessages,
            });
            setValue('acceptMessages', !acceptMessages);
            toast({
                title: response.data.message,
                variant: 'default',
            });
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse<unknown>>;
            toast({
                title: 'Error',
                description:
                    axiosError.response?.data.message ??
                    'Failed to update message settings',
                variant: 'destructive',
            });
        }
    };

    if (!user) {
        return <div></div>;
    }

    const { username } = user;

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const profileUrl = `${baseUrl}/u/${username}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl);
        toast({
            title: 'URL Copied!',
            description: 'Profile URL has been copied to clipboard.',
        });
    };

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Inbox</h1>
                    <p className="text-muted-foreground">
                        {messages.length > 0
                            ? `You have ${messages.length} ${messages.length === 1 ? 'message' : 'messages'}`
                            : 'No messages yet'}
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault();
                            fetchMessages(true);
                        }}
                        disabled={isLoading || isSwitchLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <RefreshCcw className="h-4 w-4 mr-2" />
                        )}
                        Refresh
                    </Button>

                    <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-md">
                        <Switch
                            id="accept-messages"
                            checked={acceptMessages}
                            onCheckedChange={handleSwitchChange}
                            disabled={isSwitchLoading}
                        />
                        <label htmlFor="accept-messages" className="text-sm font-medium">
                            Accepting Messages: {acceptMessages ? 'On' : 'Off'}
                        </label>
                    </div>
                </div>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Your Unique Link</CardTitle>
                    <CardDescription>
                        Share this link to receive anonymous messages
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={profileUrl}
                            readOnly
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={copyToClipboard}
                        >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy link</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {messages.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id as React.Key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <MessageCard
                                    message={message}
                                    onMessageDelete={handleDeleteMessage}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MailQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Share your unique link to start receiving anonymous messages
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserMessagesDashboard;
