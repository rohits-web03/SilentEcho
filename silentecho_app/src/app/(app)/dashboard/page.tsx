'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Lock, MailQuestion } from 'lucide-react';
import React from 'react';

export default function DashboardHome() {
  const router = useRouter();

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Your Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Anon Inbox Option */}
        <Card
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push('/dashboard/messages')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <MailQuestion className="h-10 w-10 mb-4 text-purple-600" />
            <h2 className="text-2xl font-semibold mb-2">Anon Inbox</h2>
            <p className="text-gray-600 text-center">
              View anonymous messages people have sent you
            </p>
          </CardContent>
        </Card>

        {/* Cipher Notes Option */}
        <Card
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push('/dashboard/notes')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Lock className="h-10 w-10 mb-4 text-green-600" />
            <h2 className="text-2xl font-semibold mb-2">Cipher Notes</h2>
            <p className="text-gray-600 text-center">
              Create and share encrypted notes with anyone
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
