'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ActivityRecord {
  id: number;
  title: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  participation_status: string;
  points_earned: number;
  registration_time?: string | null;
}

interface PointTransaction {
  id: number;
  points: number;
  transaction_type: 'earn' | 'consume';
  description: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [activeTab, setActiveTab] = useState('info');
  const router = useRouter();

  useEffect(() => {
    // 获取用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // 如果有真实的用户数据，加载活动和积分记录
      fetchUserData(JSON.parse(storedUser).id);
      console.log("user数据:", storedUser)
    } else {
      // 未登录，跳转到登录页
      router.push('/auth/login');
    }
  }, [router]);

  const fetchUserData = async (userId: number) => {
    try {
      setLoading(true);
      
      // 存储用户的所有活动（包括参与记录和报名记录）
      let allUserActivities: ActivityRecord[] = [];
      
      console.log('当前登录用户ID:', userId, '类型:', typeof userId);
      
      // 直接获取所有报名记录，这个API路径是后端实际支持的
      try {
        console.log('尝试获取所有报名记录...');
        // 根据后端实际API路径，这里不需要user_id参数，而是直接获取所有报名记录
        const registrationsResponse = await fetch(`http://localhost:3002/api/registrations`);
        
        if (registrationsResponse.ok) {
          const allRegistrations = await registrationsResponse.json();
          console.log('获取到的所有报名记录数量:', Array.isArray(allRegistrations) ? allRegistrations.length : 0);
          
          // 过滤出当前用户的报名记录 - 确保ID类型匹配（将API返回的user_id转为数字进行比较）
          const userRegistrations = Array.isArray(allRegistrations) ? 
            allRegistrations.filter((reg: any) => {
              const regUserId = reg.user_id ? Number(reg.user_id) : reg.user_id;
              const matches = regUserId === userId;
              if (matches) {
                console.log('找到匹配的报名记录:', reg);
              }
              return matches;
            }) : [];
          
          console.log(`当前用户ID ${userId} 的报名记录数量:`, userRegistrations.length);
          
          if (userRegistrations && userRegistrations.length > 0) {
            // 获取所有活动详情，然后匹配用户报名的活动
            try {
              const activitiesResponse = await fetch(`http://localhost:3002/api/activities`);
              if (activitiesResponse.ok) {
                const allActivities = await activitiesResponse.json();
                console.log('获取到的所有活动数量:', Array.isArray(allActivities) ? allActivities.length : 0);
                
                // 将用户的报名记录与活动详情关联起来
                for (const registration of userRegistrations) {
                  const activityId = Number(registration.activity_id);
                  console.log('尝试查找活动ID:', activityId);
                  
                  const matchedActivity = allActivities.find((act: any) => {
                    const actId = Number(act.id);
                    return actId === activityId;
                  });
                  
                  if (matchedActivity) {
                    console.log('找到匹配的活动:', matchedActivity.title);
                    
                    // 转换为活动记录格式
                    const activityRecord: ActivityRecord = {
                      id: matchedActivity.id,
                      title: matchedActivity.title,
                      status: matchedActivity.status,
                      check_in_time: registration.check_in_time,
                      check_out_time: registration.check_out_time,
                      participation_status: 'registered', // 已报名状态
                      points_earned: registration.points_earned || 0,
                      registration_time: registration.created_at
                    };
                    
                    allUserActivities.push(activityRecord);
                  } else {
                    console.log(`未找到ID为 ${activityId} 的活动详情`);
                  }
                }
              }
            } catch (error) {
              console.error('获取活动详情失败:', error);
            }
          }
        } else {
          console.error('获取报名记录失败:', registrationsResponse.status, registrationsResponse.statusText);
        }
      } catch (error) {
        console.error('获取报名记录请求失败:', error);
      }
      
      // 如果上述方法都失败，尝试另一种方式
      if (allUserActivities.length === 0) {
        try {
          console.log('尝试备用方法...');
          // 直接获取活动的所有报名记录
          const activitiesResponse = await fetch(`http://localhost:3002/api/activities`);
          
          if (activitiesResponse.ok) {
            const allActivities = await activitiesResponse.json();
            
            // 对每个活动，检查用户是否报名
            for (const activity of allActivities) {
              try {
                const activityRegistrationsResponse = await fetch(`http://localhost:3002/api/registrations/activity/${activity.id}`);
                
                if (activityRegistrationsResponse.ok) {
                  const activityRegistrations = await activityRegistrationsResponse.json();
                  // 确保当前用户ID匹配
                  const userRegistered = activityRegistrations.some((reg: any) => {
                    const regUserId = reg.user_id ? Number(reg.user_id) : reg.user_id;
                    return regUserId === userId;
                  });
                  
                  if (userRegistered) {
                    console.log(`用户(ID:${userId})已报名活动:`, activity.title);
                    
                    // 用户已报名该活动
                    const registration = activityRegistrations.find((reg: any) => {
                      const regUserId = reg.user_id ? Number(reg.user_id) : reg.user_id;
                      return regUserId === userId;
                    });
                    
                    const activityRecord: ActivityRecord = {
                      id: activity.id,
                      title: activity.title,
                      status: activity.status,
                      check_in_time: registration?.check_in_time || null,
                      check_out_time: registration?.check_out_time || null,
                      participation_status: 'registered',
                      points_earned: registration?.points_earned || 0,
                      registration_time: registration?.created_at ? registration.created_at : null
                    };
                    
                    allUserActivities.push(activityRecord);
                  }
                }
              } catch (error) {
                console.error(`获取活动 ${activity.id} 的报名记录失败:`, error);
              }
            }
          }
        } catch (error) {
          console.error('备用方法获取活动数据失败:', error);
        }
      }
      
      // 最后备用：如果仍然没有数据，添加更明确的提示
      if (allUserActivities.length === 0) {
        console.log('未找到当前用户的报名记录，不添加模拟数据');
      }
      
      // 设置最终的活动列表
      console.log(`设置的最终活动列表 (用户ID: ${userId}):`, allUserActivities);
      setActivities(allUserActivities);
      
      // 获取用户积分交易记录 - 根据实际API路径调整
      try {
        const transactionsResponse = await fetch(`http://localhost:3002/api/points/user/${userId}`);
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData);
        } else {
          console.error('获取积分数据失败:', transactionsResponse.statusText);
          setTransactions([]);
        }
      } catch (error) {
        console.error('获取积分数据请求失败:', error);
        setTransactions([]);
      }
      
      // 对活动按报名时间排序
      if (allUserActivities.length > 0) {
        // 按报名时间倒序排列（最新报名的显示在前面）
        allUserActivities.sort((a, b) => {
          if (!a.registration_time) return 1;
          if (!b.registration_time) return -1;
          return new Date(b.registration_time).getTime() - new Date(a.registration_time).getTime();
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('获取用户数据失败:', error);
      setLoading(false);
    }
  };

  // 格式化日期时间
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '- -';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 计算总积分和消费积分
  const calculatePoints = () => {
    const earned = transactions
      .filter(t => t.transaction_type === 'earn')
      .reduce((sum, t) => sum + t.points, 0);
    
    const consumed = transactions
      .filter(t => t.transaction_type === 'consume')
      .reduce((sum, t) => sum + t.points, 0);
    
    return { earned, consumed, balance: earned - consumed };
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const pointsStats = calculatePoints();

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {/* 顶部用户信息卡片 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-32 relative">
          <div className="absolute left-8 bottom-0 transform translate-y-1/2 flex items-end">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center text-white text-3xl font-medium border-4 border-white shadow-md">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4 mb-6 text-white">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-pink-100">{user.role === 'admin' ? '管理员' : '普通用户'}</p>
            </div>
          </div>
          
          <div className="absolute right-8 bottom-4 flex space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-medium">{user.totalPoints || pointsStats.balance} 积分</span>
            </div>
            <Link 
              href="/user/profile/edit" 
              className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white hover:bg-white/30 transition-colors"
            >
              编辑资料
            </Link>
          </div>
        </div>
        
        <div className="mt-16 p-6">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 font-medium ${activeTab === 'info' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-600 hover:text-pink-500'}`}
            >
              基本信息
            </button>
            <button 
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-2 font-medium ${activeTab === 'activities' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-600 hover:text-pink-500'}`}
            >
              活动记录
            </button>
            <button 
              onClick={() => setActiveTab('points')}
              className={`px-4 py-2 font-medium ${activeTab === 'points' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-600 hover:text-pink-500'}`}
            >
              积分明细
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-600 hover:text-pink-500'}`}
            >
              账户设置
            </button>
          </div>
          
          <div className="py-6">
            {/* 基本信息标签内容 */}
            {activeTab === 'info' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">用户名</h3>
                    <p className="text-lg font-medium text-gray-900">{user.username}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">邮箱</h3>
                    <p className="text-lg font-medium text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">角色</h3>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">当前积分</h3>
                    <p className="text-3xl font-bold text-pink-600">{user.totalPoints || pointsStats.balance}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">注册时间</h3>
                    <p className="text-lg font-medium text-gray-900">
                      {user.created_at ? formatDateTime(user.created_at) : '2025-09-01 08:30:00'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">参与活动数</h3>
                    <p className="text-lg font-medium text-gray-900">{activities.length}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* 活动记录标签内容 */}
            {activeTab === 'activities' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">活动参与记录</h3>
                  <Link href="/activities" className="text-sm text-pink-600 hover:text-pink-700">
                    浏览更多活动
                  </Link>
                </div>
                
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
                    <p className="text-gray-500">正在加载活动记录...</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 mb-2">暂无活动参与记录</p>
                    <p className="text-gray-400 text-sm mb-4">您还没有报名参加任何活动</p>
                    <Link href="/activities" className="inline-block px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors">
                      去浏览活动
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded-md mb-6">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-pink-700 text-sm">共找到 {activities.length} 条活动记录</p>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              活动名称
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              状态
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              报名时间
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              签到时间
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              签退时间
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              获得积分
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activities.map((activity) => (
                            <tr key={activity.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link href={`/activities/${activity.id}`} className="text-pink-600 hover:text-pink-800">
                                  {activity.title}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  activity.participation_status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : activity.participation_status === 'registered'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {activity.participation_status === 'completed' 
                                    ? '已完成' 
                                    : activity.participation_status === 'registered' 
                                      ? '已报名'
                                      : '未参与'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDateTime(activity.registration_time)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDateTime(activity.check_in_time)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDateTime(activity.check_out_time)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-pink-600">
                                  {activity.points_earned > 0 ? `+${activity.points_earned}` : '-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 积分明细标签内容 */}
            {activeTab === 'points' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-4 text-white">
                    <h3 className="text-sm font-medium text-pink-100 mb-1">当前积分</h3>
                    <p className="text-2xl font-bold">{user.totalPoints || pointsStats.balance}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <h3 className="text-sm font-medium text-green-100 mb-1">累计获取</h3>
                    <p className="text-2xl font-bold">{pointsStats.earned}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <h3 className="text-sm font-medium text-blue-100 mb-1">累计消费</h3>
                    <p className="text-2xl font-bold">{pointsStats.consumed}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">积分交易记录</h3>
                  <Link href="/points" className="text-sm text-pink-600 hover:text-pink-700">
                    查看积分中心
                  </Link>
                </div>
                
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
                    <p className="text-gray-500">正在加载积分记录...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 mb-2">暂无积分交易记录</p>
                    <p className="text-gray-400 text-sm">参加活动可以获得积分哦</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-gray-900 font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{formatDateTime(transaction.created_at)}</p>
                          </div>
                          <div className={`text-lg font-bold ${
                            transaction.transaction_type === 'earn' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'earn' ? '+' : '-'}{transaction.points}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* 账户设置标签内容 */}
            {activeTab === 'settings' && (
              <div className="max-w-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-6">账户设置</h3>
                
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">修改密码</h4>
                        <p className="text-sm text-gray-500">更新您的账户密码以确保安全</p>
                      </div>
                      <Link 
                        href="/user/profile/change-password"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        修改
                      </Link>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">邮箱绑定</h4>
                        <p className="text-sm text-gray-500">当前绑定邮箱: {user.email}</p>
                      </div>
                      <Link 
                        href="/user/profile/change-email"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        修改
                      </Link>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">注销账户</h4>
                        <p className="text-sm text-gray-500">永久删除您的账户和所有相关数据</p>
                      </div>
                      <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none">
                        注销
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 