import React, { useState } from 'react';
import { Clock, Users, AlertTriangle, CheckCircle, Menu, X } from 'lucide-react';
import { supabase, getParticipantsCount, addParticipant } from './supabase';
import LoadingScreen from './components/LoadingScreen';
import ImageSlider from './components/ImageSlider';
import AudioPlayer from './components/AudioPlayer';
import Admin from './pages/Admin';

interface FormData {
  name: string;
  phone: string;
  email: string;
}

function App() {
  // Check if we're on the admin page
  const isAdminPage = window.location.pathname === '/admin';
  
  if (isAdminPage) {
    return <Admin />;
  }

  const [isLoading, setIsLoading] = useState(true);
  const [participantsCount, setParticipantsCount] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: ''
  });
  
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number}>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<{name?: string, phone?: string, email?: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const MAX_PARTICIPANTS = 456;
  const targetDate = new Date('2025-05-04T00:00:00');

  React.useEffect(() => {
    async function loadParticipantsCount() {
      const count = await getParticipantsCount();
      setParticipantsCount(count);
    }
    
    loadParticipantsCount();
    
    const subscription = supabase
      .channel('participants-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'participants' 
      }, () => {
        loadParticipantsCount();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const errors: {name?: string, phone?: string, email?: string} = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Имя обязательно';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Телефон обязателен';
      isValid = false;
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Неверный формат телефона';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email обязателен';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Неверный формат email';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }
    
    if (participantsCount >= MAX_PARTICIPANTS) {
      alert('Извините, все места заняты!');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await addParticipant({
        name: formData.name,
        phone: formData.phone,
        email: formData.email
      });
      
      if (success) {
        setFormData({
          name: '',
          phone: '',
          email: ''
        });
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        alert('Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const spotsLeft = MAX_PARTICIPANTS - participantsCount;
  const registrationClosed = spotsLeft <= 0 || targetDate.getTime() <= new Date().getTime();

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AudioPlayer />
      {/* Header */}
      <header className="bg-pink-600 py-3 md:py-4 sticky top-0 z-30 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo and Title - Always visible */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <img 
                src="/images/Logo1.png"
                alt="Barys Game Logo" 
                className="h-10 w-10 md:h-16 md:w-16 object-contain"
              />
              <h1 className="text-xl md:text-4xl font-squid">BARYS GAME</h1>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="font-mono text-lg">{spotsLeft} мест осталось</span>
              </div>
              <img 
                src="/images/logo2.png"
                alt="Barys Game Secondary Logo" 
                className="h-12 w-12 md:h-16 md:w-16 object-contain"
              />
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pb-2 border-t border-pink-400 pt-2 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span className="font-mono text-sm">{spotsLeft} мест осталось</span>
                </div>
                <img 
                  src="/images/logo2.png"
                  alt="Barys Game Secondary Logo" 
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Image Slider */}
        <ImageSlider />
        
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Info */}
          <div className="space-y-6 md:space-y-8">
            <div className="bg-gray-900 p-4 md:p-6 rounded-lg border border-pink-600 shadow-lg">
              <h2 className="text-2xl md:text-3xl font-squid mb-3 md:mb-4">Игра начинается скоро</h2>
              <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
                Добро пожаловать в Barys Game, вдохновленную популярным сериалом "Игра в кальмара". 
                Зарегистрируйтесь сейчас, чтобы принять участие в захватывающем испытании.
              </p>
              
              {/* Countdown Timer */}
              <div className="bg-gray-800 p-3 md:p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2 text-pink-500" />
                  <h3 className="text-lg md:text-xl font-squid">Обратный отсчет</h3>
                </div>
                <div className="grid grid-cols-4 gap-1 md:gap-2 text-center">
                  <div className="bg-gray-700 p-1 md:p-2 rounded">
                    <div className="text-xl md:text-2xl font-mono">{timeLeft.days}</div>
                    <div className="text-xs text-gray-400">дней</div>
                  </div>
                  <div className="bg-gray-700 p-1 md:p-2 rounded">
                    <div className="text-xl md:text-2xl font-mono">{timeLeft.hours}</div>
                    <div className="text-xs text-gray-400">часов</div>
                  </div>
                  <div className="bg-gray-700 p-1 md:p-2 rounded">
                    <div className="text-xl md:text-2xl font-mono">{timeLeft.minutes}</div>
                    <div className="text-xs text-gray-400">минут</div>
                  </div>
                  <div className="bg-gray-700 p-1 md:p-2 rounded">
                    <div className="text-xl md:text-2xl font-mono">{timeLeft.seconds}</div>
                    <div className="text-xs text-gray-400">секунд</div>
                  </div>
                </div>
              </div>
              
              {/* Rules */}
              <div className="mt-4 md:mt-6">
                <h3 className="text-lg md:text-xl font-squid mb-2">Правила игры:</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm md:text-base">
                  <li>Регистрация закрывается 4 мая 2025 года</li>
                  <li>Только 456 участников будут допущены</li>
                  <li>Будьте готовы к испытаниям</li>
                </ul>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-gray-900 p-4 md:p-6 rounded-lg border border-pink-600 shadow-lg">
              <div className="flex justify-between mb-2 text-sm md:text-base">
                <span>Прогресс регистрации</span>
                <span>{participantsCount}/{MAX_PARTICIPANTS}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 md:h-4">
                <div 
                  className="bg-pink-600 h-3 md:h-4 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${(participantsCount / MAX_PARTICIPANTS) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Registration Form */}
          <div className="bg-gray-900 p-4 md:p-6 rounded-lg border border-pink-600 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-squid mb-4">Регистрация</h2>
            
            {registrationClosed ? (
              <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg text-center">
                <AlertTriangle className="h-10 md:h-12 w-10 md:w-12 mx-auto mb-2 text-red-500" />
                <h3 className="text-lg md:text-xl font-bold">Регистрация закрыта</h3>
                <p className="text-gray-300 mt-2 text-sm md:text-base">
                  {targetDate.getTime() <= new Date().getTime() 
                    ? "Время регистрации истекло." 
                    : "Все места заняты."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Имя и Фамилия
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${formErrors.name ? 'border-red-500' : 'border-gray-600'} rounded-md p-2 md:p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base`}
                    placeholder="Введите ваше имя"
                  />
                  {formErrors.name && <p className="mt-1 text-xs md:text-sm text-red-500">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${formErrors.phone ? 'border-red-500' : 'border-gray-600'} rounded-md p-2 md:p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base`}
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                  {formErrors.phone && <p className="mt-1 text-xs md:text-sm text-red-500">{formErrors.phone}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${formErrors.email ? 'border-red-500' : 'border-gray-600'} rounded-md p-2 md:p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base`}
                    placeholder="your@email.com"
                  />
                  {formErrors.email && <p className="mt-1 text-xs md:text-sm text-red-500">{formErrors.email}</p>}
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full ${isSubmitting ? 'bg-pink-800' : 'bg-pink-600 hover:bg-pink-700'} text-white font-bold py-2 md:py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 flex justify-center items-center text-sm md:text-base`}
                  >
                    {isSubmitting ? 'Отправка...' : 'Зарегистрироваться'}
                  </button>
                </div>
                
                <p className="text-xs md:text-sm text-gray-400 mt-3 md:mt-4">
                  Регистрируясь, вы соглашаетесь с правилами игры и принимаете все риски, связанные с участием.
                </p>
              </form>
            )}
            
            {/* Success Message */}
            {showSuccess && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
                <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-green-500 max-w-md mx-auto">
                  <CheckCircle className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-green-500" />
                  <h3 className="text-lg md:text-xl font-squid text-center">Регистрация успешна!</h3>
                  <p className="text-gray-300 text-center mt-2 text-sm md:text-base">
                    Вы успешно зарегистрированы на Barys Game. Ожидайте дальнейших инструкций на указанный email.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 py-4 md:py-6 mt-8 md:mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <div className="flex justify-center space-x-4 md:space-x-6 mb-3 md:mb-4">
            <img 
              src="/images/Logo1.png"
              alt="Barys Game Logo" 
              className="h-8 w-8 md:h-10 md:w-10 object-contain"
            />
            <img 
              src="/images/logo2.png"
              alt="Barys Game Secondary Logo" 
              className="h-8 w-8 md:h-10 md:w-10 object-contain"
            />
          </div>
          <p className="text-sm md:text-base font-squid">© 2025 Barys Game. Все права защищены.</p>
          <p className="mt-1 md:mt-2 text-xs md:text-sm">Вдохновлено сериалом "Игра в кальмара"</p>
        </div>
      </footer>
    </div>
  );
}

export default App;