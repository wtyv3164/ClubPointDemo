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
  image_url: string;
  status: string;
}

export default function HomePage() {
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

    // 获取最新活动
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // 实际项目中应该从API获取数据
      // const response = await fetch('http://localhost:3002/api/activities?limit=3');
      // const data = await response.json();
      
      // 模拟数据
      const mockActivities = [
        {
          id: 1,
          title: '社团招新活动',
          description: '欢迎新同学加入各大社团，展示自己的才华和热情！',
          start_time: '2023-09-01T09:00:00',
          end_time: '2023-09-10T18:00:00',
          location: '大学中心广场',
          image_url: '/images/recruitment.jpg',
          status: 'active'
        },
        {
          id: 2,
          title: '校园歌唱比赛',
          description: '一年一度的校园歌唱比赛，展示你的歌喉，赢取丰厚积分！',
          start_time: '2023-10-15T14:00:00',
          end_time: '2023-10-15T20:00:00',
          location: '大学礼堂',
          image_url: '/images/singing.jpg',
          status: 'upcoming'
        },
        {
          id: 3,
          title: '志愿者服务日',
          description: '参与校园环保活动，为美化校园环境贡献力量，同时获取积分奖励。',
          start_time: '2023-10-22T08:00:00',
          end_time: '2023-10-22T16:00:00',
          location: '校园各区域',
          image_url: '/images/volunteer.jpg',
          status: 'upcoming'
        }
      ];
      
      setActivities(mockActivities);
      setLoading(false);
    } catch (err) {
      console.error('获取活动失败:', err);
      setError('获取活动数据失败');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 pt-0 pb-10 overflow-x-hidden">
      {/* 顶部横幅 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="absolute inset-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.1)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                社活星云
                <span className="block text-yellow-300">让活动更精彩</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-pink-100">参与活动，获取积分，兑换奖励，提升你的校园生活体验！</p>
              <div className="flex flex-wrap gap-4">
                {!user ? (
                  <>
                    <Link 
                      href="/auth/register" 
                      className="group relative inline-flex bg-white text-pink-600 px-6 py-3 rounded-full font-medium transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10">立即注册</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-pink-400 to-pink-600 opacity-0 group-hover:opacity-100 text-white -translate-y-full group-hover:translate-y-0 transition-all duration-300"></span>
                    </Link>
                    <Link 
                      href="/auth/login" 
                      className="inline-flex items-center border-2 border-white text-white px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-all duration-300"
                    >
                      <span>登录账号</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </>
                ) : (
                  <Link 
                    href="/activities" 
                    className="group relative inline-flex bg-white text-pink-600 px-6 py-3 rounded-full font-medium transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10">浏览活动</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-pink-400 to-pink-600 opacity-0 group-hover:opacity-100 text-white -translate-y-full group-hover:translate-y-0 transition-all duration-300"></span>
                  </Link>
                )}
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="w-full h-64 md:h-80 bg-pink-200 rounded-lg overflow-hidden relative transform rotate-3 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-400 via-purple-400 to-pink-500 opacity-90"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold mb-3">加入社团，赢取积分</p>
                    <p className="max-w-xs mx-auto">参与社团活动，提升个人技能，收获友谊与成长</p>
      </div>
                </div>
              </div>
              {user && (
                <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-lg">
                  <div className="text-sm text-gray-500">当前积分</div>
                  <div className="text-2xl font-bold text-pink-600">{user.totalPoints}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,85.3C96,75,192,53,288,53.3C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,42.7C1248,43,1344,53,1392,58.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* 系统介绍 */}
      <div className="max-w-7xl mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          <span className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">系统功能介绍</span>
        </h2>
        <p className="text-gray-500 text-center max-w-3xl mx-auto mb-12">我们的社活星云帮助你轻松管理活动、积累积分、兑换奖励，让校园生活更加丰富多彩。</p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-pink-500 to-pink-300"></div>
            <div className="p-6">
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-4 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">活动管理</h3>
              <p className="text-gray-600 mb-4">浏览校园活动，在线报名参与，获取活动积分，丰富你的校园生活。</p>
              <Link href="/activities" className="inline-flex items-center text-sm font-medium text-pink-600 hover:text-pink-700">
                <span>了解更多</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-300"></div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">积分系统</h3>
              <p className="text-gray-600 mb-4">参与活动获取积分，查看积分明细，参与积分排行榜，展示你的活跃度。</p>
              <Link href="/points" className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700">
                <span>了解更多</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-300"></div>
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">积分兑换</h3>
              <p className="text-gray-600 mb-4">使用积分兑换校园周边、活动优先参与权等多种奖励，让积分创造更多价值。</p>
              <Link href="/points/redeem" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                <span>了解更多</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 活动推荐区 */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">推荐活动</h2>
            <p className="text-gray-500 mt-1">发现精彩校园活动，获取丰厚积分</p>
          </div>
          <Link href="/activities" className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium">
            <span>查看全部</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {activities.map((activity) => (
              <div key={activity.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  {/* 使用背景色代替图片，实际项目中应该加载真实图片 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-purple-400 group-hover:scale-105 transition-transform duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white text-xl font-bold">{activity.title}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      activity.status === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {activity.status === 'active' ? '进行中' : '即将开始'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1">{activity.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{activity.description}</p>
                  
                  <div className="flex items-center text-gray-500 mb-4 text-sm">
                    <div className="flex items-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(activity.start_time).split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{activity.location}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/activities/${activity.id}`}
                    className="block w-full text-center bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-2 rounded-lg transition-colors duration-300"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
