'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { signInSchema } from '@/schemas/signInSchema';
import { goapi } from '@/lib/utils';

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { toast } = useToast();

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    try {
      const response = await goapi.post(
        `/api/auth/login`,
        {
          username: data.username,
          password: data.password,
        }
      );

      if (response.data.success) {
        toast({
          title: "Login successful",
          description: "Redirecting...",
        });

        router.replace("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: response.data.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      if (error.response) {
        toast({
          title: "Login failed",
          description: error.response.data?.message || "Invalid username or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Network error",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container relative flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-lg backdrop-blur-sm">
          <div className="text-center">
            <motion.h1
              className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome Back to SilentEcho
            </motion.h1>
            <motion.p
              className="mt-3 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Sign in to continue your secret conversations
            </motion.p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <Input type="password" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="flex items-center justify-center">
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </form>
          </Form>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">
                Don&apos;t have an account?
              </span>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full mt-4 hover:bg-accent/50 transition-colors"
          >
            <Link href="/sign-up">
              Create a new account
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
