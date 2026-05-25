import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Mail, Key, Eye, EyeOff, LogIn, AlertCircle, Info } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export default function LoginScreen({ users, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState<string>('douglas@digaorestaurante.com.br');
  const [password, setPassword] = useState<string>('123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');

  // Automatically clear error or info messages when typing in fields
  useEffect(() => {
    setErrorMessage('');
    setInfoMessage('');
  }, [email, password]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Por favor, informe seu e-mail e sua senha de colaborador.');
      return;
    }

    // Find user by email or username fallback
    const matchedUser = users.find(u => 
      u.email.toLowerCase() === trimmedEmail || 
      (u.username && u.username.toLowerCase() === trimmedEmail)
    );

    if (!matchedUser) {
      setErrorMessage('Nenhum colaborador localizado com este e-mail.');
      return;
    }

    // Verify Password
    const userPassword = matchedUser.senha || '123';
    if (userPassword !== trimmedPassword) {
      setErrorMessage('A senha digitada está incorreta.');
      return;
    }

    // Check Status
    if (matchedUser.status !== 'Ativo') {
      setErrorMessage('Esta conta de colaborador está inativa.');
      return;
    }

    // Success login!
    onLogin(matchedUser);
  };

  const handleForgotPassword = () => {
    setErrorMessage('');
    setInfoMessage('As instruções para redefinição de senha foram encaminhadas ao seu e-mail corporativo cadastrado.');
  };

  return (
    <div 
      id="login-container" 
      className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-amber-200 selection:text-zinc-950 font-sans"
    >
      <div className="w-full max-w-md bg-white border-2 border-zinc-300 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
        
        {/* Dynamic High Contrast Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 mb-1">
            {/* Using deep amber and dark charcoal for beautiful, eye-catching AAA contrast */}
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center font-bold shadow-md">
              <span className="font-sora font-extrabold text-lg text-amber-500">D</span>
            </div>
            <span className="font-sora font-extrabold text-2xl tracking-tight text-zinc-950 uppercase">
              Digão<span className="text-amber-600 font-black">.</span>
            </span>
          </div>
          
          <h2 className="text-lg font-black text-zinc-950 tracking-tight">
            Painel do Colaborador
          </h2>
          <p className="text-xs text-zinc-700 font-semibold tracking-wide uppercase">
            Identifique-se para iniciar o expediente
          </p>
        </div>

        {/* Real-time feedback alerts. Enhanced with maximum border and text contrast */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-700 mt-0.5" />
            <div className="text-xs">
              <span className="font-black text-red-950 block uppercase tracking-wider text-[10px]">Acesso Recusado</span>
              <p className="mt-0.5 text-zinc-900 font-semibold leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 bg-blue-50 border-2 border-blue-500 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-150">
            <Info className="w-5 h-5 shrink-0 text-blue-700 mt-0.5" />
            <div className="text-xs">
              <span className="font-black text-blue-950 block uppercase tracking-wider text-[10px]">Esqueci minha senha</span>
              <p className="mt-0.5 text-zinc-900 font-semibold leading-relaxed">{infoMessage}</p>
            </div>
          </div>
        )}

        {/* Minimal Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          
          {/* E-mail Field */}
          <div className="space-y-1.5">
            <label htmlFor="input-login-email" className="block text-xs font-black text-zinc-900 uppercase tracking-widest">
              E-mail Corporativo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-700 pointer-events-none">
                <Mail className="w-5 h-5" />
              </span>
              <input
                id="input-login-email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-2 border-zinc-300 text-zinc-950 placeholder-zinc-500 rounded-xl pl-11 pr-3 py-3 text-sm font-semibold focus:border-amber-600 focus:ring-0 transition"
                placeholder="Ex: joao@digaorestaurante.com.br"
              />
            </div>
          </div>

          {/* Senha Field */}
          <div className="space-y-1.5">
            <label htmlFor="input-login-password" className="block text-xs font-black text-zinc-900 uppercase tracking-widest">
              Senha de Acesso
            </label>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-700 pointer-events-none">
                <Key className="w-5 h-5" />
              </span>
              <input
                id="input-login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-zinc-300 text-zinc-950 placeholder-zinc-500 rounded-xl pl-11 pr-11 py-3 text-sm font-mono font-extrabold focus:border-amber-600 focus:ring-0 transition"
                placeholder="Ex: 123"
              />
              <button
                id="btn-login-toggle-pass"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-700 hover:text-zinc-950 transition cursor-pointer"
                title={showPassword ? "Ocultar Senha" : "Exibir Senha"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Validar Credenciais Button */}
          <button
            id="btn-login-submit"
            type="submit"
            className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer shadow-md border-2 border-amber-600"
          >
            <LogIn className="w-5 h-5 text-zinc-950 stroke-[2.5]" /> Validar Credenciais
          </button>
        </form>

        {/* Forgot Password Section */}
        <div className="text-center pt-2.5 border-t border-zinc-200">
          <button
            id="btn-login-forgot-password"
            type="button"
            onClick={handleForgotPassword}
            className="text-xs font-black text-amber-750 hover:text-amber-950 hover:underline transition cursor-pointer"
          >
            Esqueci minha senha
          </button>
        </div>

        {/* Footer info with dark charcoal labels for high fidelity */}
        <div className="text-center pt-1">
          <p className="text-[10px] text-zinc-950 font-black font-mono uppercase tracking-widest border-t border-zinc-300 pt-3">
            DIGÃO RESTAURANTE S.A.
          </p>
        </div>

      </div>
    </div>
  );
}
