import React, { useState } from 'react';
import { Mail, Lock, User, ChefHat } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageWrapper } from '../components/layout/PageWrapper';

// LoginPage component

export const LoginPage: React.FC = () => {
  const { signInWithEmail, signInAsDemo, registerWithEmail, error, loading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name || 'Kullanıcı');
      }
    } catch (err) {
      // Error is handled by useAuth and displayed via error state
    }
  };

  return (
    <PageWrapper noPadding className="flex flex-col min-h-screen bg-neutral-bg">
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-[430px] mx-auto w-full">
        
        {/* Logo and Typography */}
        <div className="flex flex-col items-center mb-10">
          <div className="text-brand-primary mb-2 flex flex-col items-center">
            <ChefHat size={72} strokeWidth={1.5} />
          </div>
          <h1 className="text-[34px] font-heading font-black text-brand-primary leading-tight">EcoBite</h1>
          <p className="text-[15px] font-body text-neutral-muted mt-1">Kendi Arka Planınla Akıllı Kiler</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {!isLogin && (
            <Input
              icon={<User size={20} />}
              placeholder="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
            />
          )}
          <Input
            icon={<Mail size={20} />}
            type="email"
            placeholder="E-posta adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            icon={<Lock size={20} />}
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="text-danger text-sm font-body text-center bg-danger/10 py-2 px-3 rounded-xl animate-shake">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading} className="mt-2" size="lg">
            {loading ? 'Yükleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </Button>
        </form>

        {/* Demo Login */}
        <div className="mt-6 w-full flex flex-col items-center">
          <button
            type="button"
            onClick={signInAsDemo}
            className="font-heading font-bold text-sm text-brand-primary/80 hover:text-brand-primary transition-colors flex items-center gap-2"
          >
            <div className="w-8 h-[1px] bg-brand-primary/20" />
            Hızlıca Dene (Demo Modu)
            <div className="w-8 h-[1px] bg-brand-primary/20" />
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="mt-8 font-body text-[15px] flex items-center justify-center gap-1.5">
          <span className="text-neutral-muted">
            {isLogin ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}
          </span>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-heading font-bold text-brand-primary underline underline-offset-2 hover:text-brand-primary/80 transition-colors"
          >
            {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};
