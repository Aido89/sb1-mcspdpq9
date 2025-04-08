import React, { useState, useEffect } from 'react';
import { loginAdmin, getParticipantsList, type Participant } from '../supabase';

export default function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      loadParticipants();
    }
  }, [isLoggedIn]);

  async function loadParticipants() {
    setLoading(true);
    try {
      const data = await getParticipantsList();
      setParticipants(data);
    } catch (err) {
      setError('Ошибка при загрузке участников');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin(email, password);
      setIsLoggedIn(true);
    } catch (err) {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-6 border border-pink-600">
          <h1 className="text-2xl font-squid text-white mb-6">Админ Панель</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? 'bg-pink-800' : 'bg-pink-600 hover:bg-pink-700'} text-white font-bold py-2 px-4 rounded-md transition duration-200`}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-squid text-white">Список Участников</h1>
          <span className="text-gray-400">Всего: {participants.length}</span>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Загрузка...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : participants.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Нет зарегистрированных участников</div>
        ) : (
          <div className="bg-gray-900 rounded-lg border border-pink-600 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="p-4 text-gray-300">Имя</th>
                    <th className="p-4 text-gray-300">Телефон</th>
                    <th className="p-4 text-gray-300">Email</th>
                    <th className="p-4 text-gray-300">Дата регистрации</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {participants.map((participant) => (
                    <tr key={participant.id} className="text-gray-300">
                      <td className="p-4">{participant.name}</td>
                      <td className="p-4">{participant.phone}</td>
                      <td className="p-4">{participant.email}</td>
                      <td className="p-4">
                        {new Date(participant.created_at).toLocaleString('ru-RU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}