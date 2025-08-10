'use client';

import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Lock, MessageSquare, Shield, EyeOff, Key, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut"
    },
  })
};

export default function Home() {
  const features = [
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: 'End-to-End Encryption',
      description: 'Your messages are encrypted before they leave your device and can only be decrypted by the intended recipient.'
    },
    {
      icon: <EyeOff className="h-12 w-12 text-primary" />,
      title: 'Self-Destructing Messages',
      description: 'Set messages to automatically delete after being read or after a set period of time.'
    },
    {
      icon: <Key className="h-12 w-12 text-primary" />,
      title: 'Password Protection',
      description: 'Add an extra layer of security with password protection for your messages.'
    },
    {
      icon: <MessageSquare className="h-12 w-12 text-primary" />,
      title: 'Anonymous Messaging',
      description: 'Send messages without revealing your identity.'
    },
    {
      icon: <Lock className="h-12 w-12 text-primary" />,
      title: 'No Data Stored',
      description: 'We never store your messages on our servers after they\'ve been read or expired.'
    },
    {
      icon: <MessageSquare className="h-12 w-12 text-primary" />,
      title: 'Secure Sharing',
      description: 'Share sensitive information with confidence using our secure platform.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Glassmorphism Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-1/3 -top-1/3 h-[800px] w-[800px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-1/4 bottom-1/4 h-[600px] w-[600px] rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="min-h-screen relative flex-1 flex items-center justify-center py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Secure, Private Communication
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Send messages that self-destruct after being read. Your conversations stay private and secure, with end-to-end encryption.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all transform hover:-translate-y-0.5 hover:shadow-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#about">
                <Button variant="outline" size="lg" className="px-8 py-6 text-base font-medium group">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={0}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <motion.div variants={fadeInUp} className="mb-4">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Features
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            >
              Privacy-First Communication
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-muted-foreground"
            >
              Everything you need to communicate securely and privately.
            </motion.p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background/50 p-6 backdrop-blur-lg transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 to-background p-8 md:p-12">
              <div className="md:flex md:items-center md:space-x-12">
                <div className="md:w-1/2">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    About SilentEcho
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    SilentEcho was born from a simple idea: everyone deserves the right to private communication.
                    In an age where digital privacy is constantly under threat, we provide tools that put you in control of your data.
                  </p>
                  <div className="mt-8">
                    <Button variant="outline" className="rounded-full">
                      Learn More About Us
                    </Button>
                  </div>
                </div>
                <div className="mt-8 md:mt-0 md:w-1/2">
                  <div className="relative h-64 overflow-hidden rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm md:h-80">
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="text-center">
                        <Lock className="mx-auto h-12 w-12 text-primary" />
                        <p className="mt-4 font-medium">Your privacy is our priority</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background/50 to-background border border-border/20 backdrop-blur-lg p-8 md:p-12 shadow-xl"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Ready to experience secure communication?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Join thousands of users who trust SilentEcho for their private communications.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/sign-up" className="inline-flex items-center justify-center">
                  <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all transform hover:-translate-y-0.5 hover:shadow-lg">
                    Get Started for Free
                  </Button>
                </Link>
                <Link href="#about" className="inline-flex items-center justify-center">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-base font-medium">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
