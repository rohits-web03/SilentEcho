'use client';

import React, { useState } from 'react';
import { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
// import { CardHeader, CardContent, Card } from '@/components/ui/card';
// import { useCompletion } from 'ai/react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';
import { goapi } from '@/lib/utils';

const specialChar = '||';

// const parseStringMessages = (messageString: string): string[] => {
//   return messageString.split(specialChar);
// };

// const initialMessageString =
//   "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  // const {
  //   complete,
  //   completion,
  //   isLoading: isSuggestLoading,
  //   error,
  // } = useCompletion({
  //   api: '/api/suggest-messages',
  //   initialCompletion: initialMessageString,
  // });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await goapi.post<ApiResponse<unknown>>(`/api/messages/`, {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: 'default',
      });
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to sent message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchSuggestedMessages = async () => {
  //   try {
  //     complete('');
  //   } catch (error) {
  //     console.error('Error fetching messages:', error);
  //     // Handle error appropriately
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border/50">
          {/* Header */}
          <div className="bg-primary/5 p-6 text-center border-b border-border/50">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Send Anonymous Message
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your message will be delivered to @{username} privately
            </p>
          </div>

          {/* Message Form */}
          <div className="p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium text-foreground/80">
                        Your Message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your anonymous message here..."
                          className="min-h-[120px] text-base border-border/70 focus-visible:ring-2 focus-visible:ring-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  {isLoading ? (
                    <Button
                      className="w-full py-6 text-base font-medium transition-all"
                      disabled
                    >
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending your message...
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading || !messageContent}
                      className="w-full py-6 text-base font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
                      size="lg"
                    >
                      Send Anonymously
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            {/* Divider with text */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Want your own message board?
                </span>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Create your account and start receiving anonymous messages
              </p>
              <Link href="/sign-up">
                <Button
                  variant="outline"
                  className="w-full border-primary/30 text-foreground/90 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                  size="lg"
                >
                  Create Your Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          All messages are end-to-end encrypted and completely anonymous
        </p>
      </div>
    </div>
  );
}
