import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Cloud, ShieldCheck, Zap } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md border border-slate-100">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform -rotate-6">
                <Cloud size={36} />
            </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">GeminiCloud Drive</h1>
        <p className="text-slate-500 text-center mb-8">Secure, smart storage powered by AI.</p>
        
        <div className="space-y-4">
            <button 
                onClick={login}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-xl"
            >
                <img src="https://clerk.com/favicon.ico" className="w-5 h-5 filter invert" alt="Clerk" />
                <span>Continue with Clerk (Mock)</span>
            </button>
            
            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-slate-400 uppercase tracking-wider">Features</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                    <ShieldCheck className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-indigo-900">Secure Storage</span>
                 </div>
                 <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                    <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-purple-900">Gemini AI</span>
                 </div>
            </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400">
            This is a demo application. No real user data is sent to a server.
        </p>
      </div>
    </div>
  );
};
