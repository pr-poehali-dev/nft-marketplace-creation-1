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

interface User {
  id: number;
  email: string;
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

  const t = translations[language];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogin = (email: string, password: string) => {
    if (email && password) {
      setCurrentUser({ id: 1, email, balance: 0 });
      setLoginOpen(false);
      toast.success(language === 'ru' ? 'Вход выполнен' : 'Logged in successfully');
    }
  };

  const handleRegister = (email: string, password: string) => {
    if (email && password) {
      setCurrentUser({ id: 1, email, balance: 0 });
      setRegisterOpen(false);
      toast.success(language === 'ru' ? 'Регистрация успешна' : 'Registration successful');
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
                          formData.get('password') as string
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
                        <Button type="submit" className="w-full">
                          {t.register}
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
                    <CardTitle>{currentUser.email}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{t.balance}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💎</span>
                        <span className="text-3xl font-bold">{currentUser.balance}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t.topup}</CardTitle>
                    <CardDescription>
                      {language === 'ru'
                        ? '1 энефтикс = 10 рублей. Средства переводятся на карту Т-Банка 2200701206723980'
                        : '1 eneftix = 10 rubles. Funds are transferred to T-Bank card 2200701206723980'}
                    </CardDescription>
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
          </div>
        )}

        {activeTab === 'support' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">{t.support}</h2>
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ru'
                    ? 'Напишите в поддержку'
                    : 'Contact Support'}
                </CardTitle>
                <CardDescription>
                  {language === 'ru'
                    ? 'Отправьте сообщение владельцу (chozadushchoutotakoe10@gmail.com)'
                    : 'Send a message to the owner (chozadushchoutotakoe10@gmail.com)'}
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
