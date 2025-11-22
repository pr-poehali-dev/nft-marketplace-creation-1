import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const API_URL = 'https://functions.poehali.dev/dd412e45-0e97-4737-9d07-6ab596b9b773';

interface User {
  id: number;
  email: string;
  nickname?: string;
  balance: number;
}

interface NFT {
  id: number;
  title: string;
  description: string;
  image_url: string;
  price: number;
  owner_id: number;
  creator_id: number;
}

const translations = {
  ru: {
    home: 'Главная',
    profile: 'Профиль',
    support: 'Поддержка',
    about: 'Подробнее',
    settings: 'Настройки',
    login: 'Вход',
    register: 'Регистрация',
    logout: 'Выйти',
    email: 'Email',
    password: 'Пароль',
    newPassword: 'Новый пароль',
    nickname: 'Никнейм',
    balance: 'Баланс',
    topup: 'Пополнить',
    uploadNFT: 'Загрузить NFT',
    title: 'Название',
    description: 'Описание',
    price: 'Цена',
    imageUrl: 'URL изображения',
    send: 'Отправить',
    message: 'Сообщение',
    theme: 'Тема',
    language: 'Язык',
    light: 'Светлая',
    dark: 'Тёмная',
    noNFTs: 'NFT пока нет. Будьте первым, кто добавит свою работу!',
    aboutText: 'Этот сайт создан для того, чтобы художники могли зарабатывать!',
    buy: 'Купить',
    cardNumber: 'Номер карты',
    amount: 'Сумма (₽)',
    uploadCost: 'Стоимость загрузки: 15 энефтиксов',
    notEnoughBalance: 'Недостаточно энефтиксов',
    loginRequired: 'Войдите в систему',
    verificationCode: 'Код подтверждения',
    verify: 'Подтвердить',
    noCode: 'Не приходит код?',
    usePassword: 'Войти с паролем',
    enterPasswordToVerify: 'Введите пароль для подтверждения',
    forgotPassword: 'Забыли пароль?',
    resetPassword: 'Сбросить пароль',
    sendCode: 'Отправить код',
    verifyEmail: 'Подтвердите email',
    enterCode: 'Введите код из письма',
    updateNickname: 'Изменить никнейм',
    save: 'Сохранить',
    optional: 'необязательно',
    paymentInfo: 'После ввода данных карты средства будут обработаны платёжной системой',
  },
  en: {
    home: 'Home',
    profile: 'Profile',
    support: 'Support',
    about: 'About',
    settings: 'Settings',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    newPassword: 'New Password',
    nickname: 'Nickname',
    balance: 'Balance',
    topup: 'Top Up',
    uploadNFT: 'Upload NFT',
    title: 'Title',
    description: 'Description',
    price: 'Price',
    imageUrl: 'Image URL',
    send: 'Send',
    message: 'Message',
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    noNFTs: 'No NFTs yet. Be the first to add your artwork!',
    aboutText: 'This site was created so that artists can earn money!',
    buy: 'Buy',
    cardNumber: 'Card Number',
    amount: 'Amount (₽)',
    uploadCost: 'Upload cost: 15 eneftix',
    notEnoughBalance: 'Not enough eneftix',
    loginRequired: 'Please login',
    verificationCode: 'Verification Code',
    verify: 'Verify',
    noCode: 'Code not received?',
    usePassword: 'Login with password',
    enterPasswordToVerify: 'Enter password to verify',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    sendCode: 'Send Code',
    verifyEmail: 'Verify Email',
    enterCode: 'Enter code from email',
    updateNickname: 'Update Nickname',
    save: 'Save',
    optional: 'optional',
    paymentInfo: 'After entering card details, funds will be processed by payment system',
  },
};

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [pendingPassword, setPendingPassword] = useState<string>('');
  const [verifyMode, setVerifyMode] = useState<'code' | 'password'>('code');
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleRegister = async (email: string, password: string, nickname: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password, nickname: nickname || null }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setPendingUserId(data.user_id);
        setPendingPassword(password);
        setVerifyMode('code');
        setRegisterOpen(false);
        setVerifyOpen(true);
        toast.success(
          language === 'ru' 
            ? `Код подтверждения: ${data.verification_code}` 
            : `Verification code: ${data.verification_code}`
        );
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка регистрации' : 'Registration error');
    }
  };

  const handleVerify = async (code: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', user_id: pendingUserId, code }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setVerifyOpen(false);
        toast.success(language === 'ru' ? 'Email подтверждён! Теперь войдите' : 'Email verified! Please login');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка верификации' : 'Verification error');
    }
  };

  const handleVerifyWithPassword = async (password: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_with_password', user_id: pendingUserId, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setCurrentUser(data.user);
        setVerifyOpen(false);
        toast.success(language === 'ru' ? 'Вход выполнен успешно!' : 'Logged in successfully!');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка верификации' : 'Verification error');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setCurrentUser(data.user);
        setLoginOpen(false);
        toast.success(language === 'ru' ? 'Вход выполнен' : 'Logged in successfully');
      } else if (response.status === 403) {
        setPendingUserId(data.user_id);
        setPendingPassword(password);
        setVerifyMode('code');
        setLoginOpen(false);
        setVerifyOpen(true);
        toast.error(language === 'ru' ? 'Подтвердите email' : 'Please verify email');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка входа' : 'Login error');
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot_password', email }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setPendingUserId(data.user_id);
        setForgotPasswordOpen(false);
        setResetPasswordOpen(true);
        toast.success(
          language === 'ru'
            ? `Код для сброса: ${data.reset_code}`
            : `Reset code: ${data.reset_code}`
        );
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка' : 'Error');
    }
  };

  const handleResetPassword = async (code: string, newPassword: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', user_id: pendingUserId, code, new_password: newPassword }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setResetPasswordOpen(false);
        toast.success(language === 'ru' ? 'Пароль изменён' : 'Password reset');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка' : 'Error');
    }
  };

  const handleUpdateNickname = async (nickname: string) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_nickname', user_id: currentUser.id, nickname }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setCurrentUser({ ...currentUser, nickname: data.nickname });
        setNicknameDialogOpen(false);
        toast.success(language === 'ru' ? 'Никнейм обновлён' : 'Nickname updated');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка' : 'Error');
    }
  };

  const handleTopUp = (amount: number) => {
    if (currentUser) {
      const eneftix = Math.floor(amount / 10);
      setCurrentUser({ ...currentUser, balance: currentUser.balance + eneftix });
      toast.success(
        language === 'ru'
          ? `Баланс пополнен на ${eneftix} энефтиксов`
          : `Balance topped up by ${eneftix} eneftix`
      );
    }
  };

  const handleUploadNFT = (title: string, description: string, imageUrl: string, price: number) => {
    if (currentUser) {
      if (currentUser.balance < 15) {
        toast.error(t.notEnoughBalance);
        return;
      }
      const newNFT: NFT = {
        id: nfts.length + 1,
        title,
        description,
        image_url: imageUrl,
        price,
        owner_id: currentUser.id,
        creator_id: currentUser.id,
      };
      setNfts([...nfts, newNFT]);
      setCurrentUser({ ...currentUser, balance: currentUser.balance - 15 });
      toast.success(language === 'ru' ? 'NFT загружен!' : 'NFT uploaded!');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">💎</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              NFTures
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={activeTab === 'home' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('home')}
            >
              <Icon name="Home" className="mr-2 h-4 w-4" />
              {t.home}
            </Button>
            <Button
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('profile')}
            >
              <Icon name="User" className="mr-2 h-4 w-4" />
              {t.profile}
            </Button>
            <Button
              variant={activeTab === 'support' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('support')}
            >
              <Icon name="MessageCircle" className="mr-2 h-4 w-4" />
              {t.support}
            </Button>
            <Button
              variant={activeTab === 'about' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('about')}
            >
              <Icon name="Info" className="mr-2 h-4 w-4" />
              {t.about}
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('settings')}
            >
              <Icon name="Settings" className="mr-2 h-4 w-4" />
              {t.settings}
            </Button>

            {!currentUser ? (
              <>
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Icon name="LogIn" className="mr-2 h-4 w-4" />
                      {t.login}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.login}</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleLogin(
                          formData.get('email') as string,
                          formData.get('password') as string
                        );
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="login-email">{t.email}</Label>
                          <Input id="login-email" name="email" type="email" required />
                        </div>
                        <div>
                          <Label htmlFor="login-password">{t.password}</Label>
                          <Input id="login-password" name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">
                          {t.login}
                        </Button>
                        <Button
                          type="button"
                          variant="link"
                          className="w-full"
                          onClick={() => {
                            setLoginOpen(false);
                            setForgotPasswordOpen(true);
                          }}
                        >
                          {t.forgotPassword}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                      {t.register}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.register}</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleRegister(
                          formData.get('email') as string,
                          formData.get('password') as string,
                          formData.get('nickname') as string
                        );
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="register-email">{t.email}</Label>
                          <Input id="register-email" name="email" type="email" required />
                        </div>
                        <div>
                          <Label htmlFor="register-password">{t.password}</Label>
                          <Input id="register-password" name="password" type="password" required />
                        </div>
                        <div>
                          <Label htmlFor="register-nickname">{t.nickname} ({t.optional})</Label>
                          <Input id="register-nickname" name="nickname" />
                        </div>
                        <Button type="submit" className="w-full">
                          {t.register}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.verifyEmail}</DialogTitle>
                      <DialogDescription>
                        {verifyMode === 'code' ? t.enterCode : t.enterPasswordToVerify}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {verifyMode === 'code' ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleVerify(formData.get('code') as string);
                        }}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="verify-code">{t.verificationCode}</Label>
                            <Input id="verify-code" name="code" required maxLength={6} />
                          </div>
                          <Button type="submit" className="w-full">
                            {t.verify}
                          </Button>
                          <Button
                            type="button"
                            variant="link"
                            className="w-full"
                            onClick={() => setVerifyMode('password')}
                          >
                            {t.noCode}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleVerifyWithPassword(formData.get('password') as string);
                        }}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="verify-password">{t.password}</Label>
                            <Input id="verify-password" name="password" type="password" required />
                          </div>
                          <Button type="submit" className="w-full">
                            {t.usePassword}
                          </Button>
                          <Button
                            type="button"
                            variant="link"
                            className="w-full"
                            onClick={() => setVerifyMode('code')}
                          >
                            {t.enterCode}
                          </Button>
                        </div>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>

                <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.forgotPassword}</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleForgotPassword(formData.get('email') as string);
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="forgot-email">{t.email}</Label>
                          <Input id="forgot-email" name="email" type="email" required />
                        </div>
                        <Button type="submit" className="w-full">
                          {t.sendCode}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.resetPassword}</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleResetPassword(
                          formData.get('code') as string,
                          formData.get('newPassword') as string
                        );
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="reset-code">{t.verificationCode}</Label>
                          <Input id="reset-code" name="code" required maxLength={6} />
                        </div>
                        <div>
                          <Label htmlFor="reset-password">{t.newPassword}</Label>
                          <Input id="reset-password" name="newPassword" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">
                          {t.resetPassword}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10">
                  <span className="text-lg">💎</span>
                  <span className="font-semibold">{currentUser.balance}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setCurrentUser(null)}>
                  <Icon name="LogOut" className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container py-8">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">{t.home}</h2>
              {currentUser && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg">
                      <Icon name="Upload" className="mr-2 h-5 w-5" />
                      {t.uploadNFT}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t.uploadNFT}</DialogTitle>
                      <DialogDescription>{t.uploadCost}</DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleUploadNFT(
                          formData.get('title') as string,
                          formData.get('description') as string,
                          formData.get('imageUrl') as string,
                          parseInt(formData.get('price') as string)
                        );
                        (e.target as HTMLFormElement).reset();
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">{t.title}</Label>
                          <Input id="title" name="title" required />
                        </div>
                        <div>
                          <Label htmlFor="description">{t.description}</Label>
                          <Textarea id="description" name="description" />
                        </div>
                        <div>
                          <Label htmlFor="imageUrl">{t.imageUrl}</Label>
                          <Input id="imageUrl" name="imageUrl" required />
                        </div>
                        <div>
                          <Label htmlFor="price">{t.price} (💎)</Label>
                          <Input id="price" name="price" type="number" min="1" required />
                        </div>
                        <Button type="submit" className="w-full" disabled={currentUser.balance < 15}>
                          {t.uploadNFT}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {nfts.length === 0 ? (
              <Card className="py-16">
                <CardContent className="text-center">
                  <Icon name="Image" className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl text-muted-foreground">{t.noNFTs}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((nft) => (
                  <Card key={nft.id} className="overflow-hidden hover-scale">
                    <img
                      src={nft.image_url}
                      alt={nft.title}
                      className="w-full h-64 object-cover"
                    />
                    <CardHeader>
                      <CardTitle>{nft.title}</CardTitle>
                      <CardDescription>{nft.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-xl">💎</span>
                        <span className="text-xl font-bold">{nft.price}</span>
                      </div>
                      <Button disabled={!currentUser}>
                        <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
                        {t.buy}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">{t.profile}</h2>
            {!currentUser ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Icon name="UserCircle" className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl text-muted-foreground">{t.loginRequired}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{currentUser.nickname || currentUser.email}</CardTitle>
                    <CardDescription>{currentUser.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{t.balance}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💎</span>
                        <span className="text-3xl font-bold">{currentUser.balance}</span>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setNicknameDialogOpen(true)} className="w-full">
                      <Icon name="Edit" className="mr-2 h-4 w-4" />
                      {t.updateNickname}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t.topup}</CardTitle>
                    <CardDescription>{t.paymentInfo}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleTopUp(parseInt(formData.get('amount') as string));
                        (e.target as HTMLFormElement).reset();
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cardNumber">{t.cardNumber}</Label>
                          <Input id="cardNumber" name="cardNumber" placeholder="0000 0000 0000 0000" required />
                        </div>
                        <div>
                          <Label htmlFor="amount">{t.amount}</Label>
                          <Input id="amount" name="amount" type="number" min="10" step="10" required />
                        </div>
                        <Button type="submit" className="w-full">
                          <Icon name="CreditCard" className="mr-2 h-4 w-4" />
                          {t.topup}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            <Dialog open={nicknameDialogOpen} onOpenChange={setNicknameDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.updateNickname}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleUpdateNickname(formData.get('nickname') as string);
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-nickname">{t.nickname}</Label>
                      <Input
                        id="new-nickname"
                        name="nickname"
                        defaultValue={currentUser?.nickname || ''}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {t.save}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">{t.support}</h2>
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ru' ? 'Напишите в поддержку' : 'Contact Support'}
                </CardTitle>
                <CardDescription>
                  {language === 'ru'
                    ? 'Отправьте сообщение администрации сайта'
                    : 'Send a message to site administration'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast.success(
                      language === 'ru' ? 'Сообщение отправлено!' : 'Message sent!'
                    );
                    (e.target as HTMLFormElement).reset();
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="support-message">{t.message}</Label>
                      <Textarea
                        id="support-message"
                        name="message"
                        rows={6}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={!currentUser}>
                      <Icon name="Send" className="mr-2 h-4 w-4" />
                      {t.send}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">{t.about}</h2>
            <Card>
              <CardContent className="py-16">
                <div className="text-center space-y-4">
                  <span className="text-6xl">🎨</span>
                  <p className="text-2xl font-semibold">{t.aboutText}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">{t.settings}</h2>
            <Card>
              <CardHeader>
                <CardTitle>{t.theme}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-switch" className="flex items-center gap-2">
                    <Icon name={isDark ? 'Moon' : 'Sun'} className="h-5 w-5" />
                    {isDark ? t.dark : t.light}
                  </Label>
                  <Switch
                    id="theme-switch"
                    checked={isDark}
                    onCheckedChange={setIsDark}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.language}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={language} onValueChange={(val) => setLanguage(val as 'ru' | 'en')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}