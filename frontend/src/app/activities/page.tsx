'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Activity {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  created_at: string;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 获取用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // 获取活动列表
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const userId = storedUser ? JSON.parse(storedUser).id : null;
        const url = userId 
          ? `http://localhost:3002/api/activities?userId=${userId}` 
          : 'http://localhost:3002/api/activities';
          
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('获取活动列表失败');
        }
        
        const data = await response.json();
        setActivities(data);
      } catch (err: any) {
        setError(err.message || '获取活动列表失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);

  const handleRegister = async (activityId: number) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3002/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_id: activityId,
          user_id: user.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '报名失败');
      }
      
      alert('报名成功！');
    } catch (err: any) {
      alert(err.message || '报名失败，请稍后再试');
    }
  };
  
  const handlePublish = async (activityId: number) => {
    if (!user || user.role !== 'admin') {
      alert('权限不足，只有管理员可以发布活动');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3002/api/activities/${activityId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'published',
          userId: user.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '发布活动失败');
      }
      
      // 更新活动状态
      setActivities(activities.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: 'published' } 
          : activity
      ));
      
      alert('活动已成功发布！');
    } catch (err: any) {
      alert(err.message || '发布活动失败，请稍后再试');
    }
  };

  // 格式化日期时间
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">活动列表</h1>
        {user && user.role === 'admin' && (
          <Link 
            href="/activities/create"
            className="rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
          >
            创建活动
          </Link>
        )}
      </div>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无活动数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold mb-2">{activity.title}</h2>
                  <span 
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      activity.status === 'published' ? 'bg-green-100 text-green-800' :
                      activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {
                      activity.status === 'published' ? '已发布' :
                      activity.status === 'completed' ? '已完成' :
                      activity.status === 'cancelled' ? '已取消' :
                      '草稿'
                    }
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{activity.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDateTime(activity.start_time)} - {formatDateTime(activity.end_time)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{activity.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>最多 {activity.max_participants || '不限'} 人</span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  {user && user.role === 'admin' && activity.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(activity.id)}
                      className="rounded-md bg-green-600 py-1.5 px-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none"
                    >
                      发布
                    </button>
                  )}
                  
                  {activity.status === 'published' && (
                    <button
                      onClick={() => handleRegister(activity.id)}
                      className="rounded-md bg-blue-600 py-1.5 px-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
                    >
                      报名
                    </button>
                  )}
                  
                  <Link
                    href={`/activities/${activity.id}`}
                    className="rounded-md bg-gray-200 py-1.5 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-300 focus:outline-none"
                  >
                    详情
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}