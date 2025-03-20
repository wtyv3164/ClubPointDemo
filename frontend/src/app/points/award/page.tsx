'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PointRule {
  id: number;
  rule_name: string;
  rule_type: 'earn' | 'consume';
  action_type: string;
  points: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  total_points: number;
}

export default function AwardPointsPage() {
  const [userId, setUserId] = useState('');
  const [ruleId, setRuleId] = useState('');
  const [points, setPoints] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<PointRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
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
    
    // 检查用户权限
    const userObj = JSON.parse(storedUser);
    if (userObj.role !== 'admin') {
      // 如果不是管理员，跳转到首页
      router.push('/');
      alert('权限不足，只有管理员可以手动发放积分');
      return;
    }
    
    // 获取积分规则列表
    fetchRules();
    
    // 获取用户列表
    fetchUsers();
  }, [router]);

  const fetchRules = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/point-rules');
      
      if (!response.ok) {
        throw new Error('获取积分规则列表失败');
      }
      
      const data = await response.json();
      // 过滤出激活的规则
      const activeRules = data.filter((rule: any) => rule.is_active);
      setRules(activeRules);
    } catch (err: any) {
      console.error('获取积分规则列表失败:', err);
      setError('获取积分规则列表失败，请稍后再试');
    }
  };
  
  const fetchUsers = async (retryCount = 0) => {
    try {
      setIsLoadingUsers(true);
      // 从后端获取真实用户数据
      const response = await fetch('http://localhost:3002/api/users');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('获取用户列表失败:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // 如果是网络错误且重试次数小于3次，则重试
        if (response.status === 0 && retryCount < 3) {
          console.log(`重试获取用户列表 (${retryCount + 1}/3)...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
          return fetchUsers(retryCount + 1);
        }
        
        throw new Error(`获取用户列表失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('获取到的用户列表:', data);
      
      if (!Array.isArray(data)) {
        console.error('返回的数据格式不正确:', data);
        throw new Error('返回的数据格式不正确');
      }
      
      setUsers(data);
      setError('');
    } catch (err: any) {
      console.error('获取用户列表失败:', err);
      setError(`获取用户列表失败: ${err.message}`);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 检查用户是否为管理员
    if (!user || user.role !== 'admin') {
      setError('权限不足，只有管理员可以手动发放积分');
      return;
    }
    
    // 验证表单
    if (!userId || !ruleId || !points) {
      setError('用户、规则和积分值为必填项');
      return;
    }
    
    setLoading(true);

    try {
      // 查找用户名用于显示
      const targetUser = users.find(u => u.id === parseInt(userId));
      const ruleName = rules.find(r => r.id === parseInt(ruleId))?.rule_name || '';
      const ruleType = rules.find(r => r.id === parseInt(ruleId))?.rule_type || 'earn';
      
      const response = await fetch('http://localhost:3002/api/points/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          ruleId: parseInt(ruleId),
          points: parseInt(points),
          description: description || `管理员手动${ruleType === 'earn' ? '发放' : '扣除'}积分`,
          operatorId: user.id // 操作人ID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '发放积分失败');
      }

      // 设置成功信息
      setSuccess(`成功${ruleType === 'earn' ? '发放' : '扣除'} ${points} 积分给用户 ${targetUser?.username || userId}！`);
      
      // 重置表单
      setUserId('');
      setRuleId('');
      setPoints('');
      setDescription('');
      
      // 刷新用户列表以显示更新后的积分
      fetchUsers();
    } catch (err: any) {
      setError(err.message || '发放积分失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 根据选择的规则自动填充积分值
  const handleRuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRuleId = e.target.value;
    setRuleId(selectedRuleId);
    
    if (selectedRuleId) {
      const selectedRule = rules.find(rule => rule.id === parseInt(selectedRuleId));
      if (selectedRule) {
        setPoints(selectedRule.points.toString());
      }
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
      <h1 className="text-2xl font-bold mb-6">手动发放积分</h1>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
              用户
            </label>
            <select
              id="userId"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">-- 选择用户 --</option>
              {isLoadingUsers ? (
                <option disabled>加载用户列表中...</option>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email}) - 当前积分: {user.total_points}
                  </option>
                ))
              ) : (
                <option disabled>暂无用户数据</option>
              )}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="ruleId" className="block text-sm font-medium text-gray-700">
              积分规则
            </label>
            <select
              id="ruleId"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={ruleId}
              onChange={handleRuleChange}
            >
              <option value="">-- 选择规则 --</option>
              {rules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.rule_name} ({rule.rule_type === 'earn' ? '获取' : '消耗'}) - {rule.points}积分
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="points" className="block text-sm font-medium text-gray-700">
              积分值
            </label>
            <input
              type="number"
              id="points"
              required
              min="1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
            <p className="text-xs text-gray-500">默认使用规则中的积分值，可以手动修改</p>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              描述
            </label>
            <textarea
              id="description"
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入积分发放/扣除的原因"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="mr-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => router.push('/points')}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? '处理中...' : '发放积分'}
          </button>
        </div>
      </form>
    </div>
  );
} 