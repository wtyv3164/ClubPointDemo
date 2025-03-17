'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PointTransaction {
  id: number;
  user_id: number;
  rule_id: number;
  points: number;
  transaction_type: 'earn' | 'consume';
  reference_id: number | null;
  reference_type: string | null;
  description: string;
  operator_id: number | null;
  expire_at: string | null;
  created_at: string;
  rule_name: string;
  action_type: string;
  operator_name: string | null;
}

interface LeaderboardUser {
  id: number;
  username: string;
  total_points: number;
}

interface StatData {
  time_period: string;
  total_points: number;
  transaction_count: number;
}

export default function PointsPage() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [earnStats, setEarnStats] = useState<StatData[]>([]);
  const [consumeStats, setConsumeStats] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('transactions');
  const [period, setPeriod] = useState('month');
  const [transactionType, setTransactionType] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 获取用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // 如果未登录，跳转到登录页
      router.push('/auth/login');
      return;
    }
    
    // 获取积分交易记录
    fetchTransactions();
    
    // 获取积分排行榜
    fetchLeaderboard();
    
    // 获取积分统计数据
    fetchStats();
  }, []);

  const fetchTransactions = async (type = '') => {
    setLoading(true);
    try {
      const userObj = JSON.parse(localStorage.getItem('user') || '{}');
      const url = `http://localhost:3002/api/points/user/${userObj.id}${type ? `?transactionType=${type}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('获取积分记录失败');
      }
      
      const data = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || '获取积分记录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/points/leaderboard?limit=10');
      
      if (!response.ok) {
        throw new Error('获取积分排行榜失败');
      }
      
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (err: any) {
      console.error('获取积分排行榜失败:', err);
    }
  };
  
  const fetchStats = async (selectedPeriod = 'month') => {
    try {
      const userObj = JSON.parse(localStorage.getItem('user') || '{}');
      const url = `http://localhost:3002/api/points/stats?userId=${userObj.id}&period=${selectedPeriod}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('获取积分统计数据失败');
      }
      
      const data = await response.json();
      setEarnStats(data.earnStats);
      setConsumeStats(data.consumeStats);
    } catch (err: any) {
      console.error('获取积分统计数据失败:', err);
    }
  };

  const handleTransactionTypeChange = (type: string) => {
    setTransactionType(type);
    fetchTransactions(type);
  };
  
  const handlePeriodChange = (selectedPeriod: string) => {
    setPeriod(selectedPeriod);
    fetchStats(selectedPeriod);
  };

  // 格式化日期时间
  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '无';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 如果未登录，显示加载状态
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的积分</h1>
        <div className="text-lg font-semibold">
          当前积分: <span className="text-blue-600">{user.totalPoints}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              积分明细
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              积分统计
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'leaderboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              积分排行榜
            </button>
          </nav>
        </div>
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
      
      {activeTab === 'transactions' && (
        <div>
          <div className="mb-4 flex space-x-4">
            <button
              onClick={() => handleTransactionTypeChange('')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                transactionType === '' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => handleTransactionTypeChange('earn')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                transactionType === 'earn' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              获取
            </button>
            <button
              onClick={() => handleTransactionTypeChange('consume')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                transactionType === 'consume' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              消耗
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无积分记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      时间
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      积分
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      规则
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      描述
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      过期时间
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.transaction_type === 'earn' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.transaction_type === 'earn' ? '获取' : '消耗'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.transaction_type === 'earn' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.transaction_type === 'earn' ? '+' : '-'}{transaction.points}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.rule_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.expire_at ? formatDateTime(transaction.expire_at) : '永久'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'stats' && (
        <div>
          <div className="mb-4 flex space-x-4">
            <button
              onClick={() => handlePeriodChange('day')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                period === 'day' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              按日
            </button>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                period === 'week' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              按周
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                period === 'month' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              按月
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">积分获取统计</h3>
              {earnStats.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无数据</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          时间段
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          获取积分
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          交易次数
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {earnStats.map((stat, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.time_period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            +{stat.total_points}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.transaction_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">积分消耗统计</h3>
              {consumeStats.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无数据</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          时间段
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          消耗积分
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          交易次数
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {consumeStats.map((stat, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.time_period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                            -{stat.total_points}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.transaction_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'leaderboard' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">积分排行榜</h3>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无数据</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      排名
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      积分
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((user, index) => (
                    <tr key={user.id} className={user.id === parseInt(JSON.parse(localStorage.getItem('user') || '{}').id) ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-yellow-400 text-white' :
                            index === 1 ? 'bg-gray-300 text-gray-800' :
                            index === 2 ? 'bg-yellow-700 text-white' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                          {user.id === parseInt(JSON.parse(localStorage.getItem('user') || '{}').id) && (
                            <span className="ml-2 text-xs text-blue-600">(我)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.total_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 