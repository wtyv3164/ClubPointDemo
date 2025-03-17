'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateActivityPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [clubId, setClubId] = useState('');
  const [clubs, setClubs] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 获取用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // 如果未登录，跳转到登录页
      router.push('/auth/login');
    }
    
    // 获取社团列表
    const fetchClubs = async () => {
      try {
        // 这里假设有获取社团列表的API
        // const response = await fetch('http://localhost:3002/api/clubs');
        // const data = await response.json();
        // setClubs(data);
        
        // 模拟社团数据
        setClubs([
          { id: 1, name: '计算机协会' },
          { id: 2, name: '篮球社' },
          { id: 3, name: '摄影社' },
        ]);
      } catch (err) {
        console.error('获取社团列表失败', err);
      }
    };
    
    fetchClubs();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 检查用户权限
    if (!user || user.role !== 'admin') {
      setError('权限级别不够，无法创建活动');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3002/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          start_time: startTime,
          end_time: endTime,
          location,
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
          club_id: parseInt(clubId),
          userId: user.id // 传递用户ID用于权限验证
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '创建活动失败');
      }

      // 跳转到活动列表页
      router.push('/activities');
    } catch (err: any) {
      setError(err.message || '创建活动失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 如果未登录或加载中，显示加载状态
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">创建新活动</h1>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              活动名称
            </label>
            <input
              type="text"
              id="title"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="clubId" className="block text-sm font-medium text-gray-700">
              社团
            </label>
            <select
              id="clubId"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
            >
              <option value="">-- 选择社团 --</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
              开始时间
            </label>
            <input
              type="datetime-local"
              id="startTime"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
              结束时间
            </label>
            <input
              type="datetime-local"
              id="endTime"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              活动地点
            </label>
            <input
              type="text"
              id="location"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
              最大参与人数
            </label>
            <input
              type="number"
              id="maxParticipants"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              活动描述
            </label>
            <textarea
              id="description"
              rows={4}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="mr-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => router.push('/activities')}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? '创建中...' : '创建活动'}
          </button>
        </div>
      </form>
    </div>
  );
}