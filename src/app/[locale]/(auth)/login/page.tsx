'use client';

import { LoginForm } from '@/components/auth/login-form';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <LoginForm />
      </motion.div>
    </div>
  );
}
