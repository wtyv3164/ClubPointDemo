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
  
  const fetchUsers = async () => {
    try {
      // 这里假设有获取用户列表的API
      // 实际项目中应该实现这个API
      // 这里使用模拟数据
      setUsers([
        { id: 1, username: '用户1', email: 'user1@example.com', total_points: 100 },
        { id: 2, username: '用户2', email: 'user2@example.com', total_points: 200 },
        { id: 3, username: '用户3', email: 'user3@example.com', total_points: 300 },
      ]);
    } catch (err: any) {
      console.error('获取用户列表失败:', err);
      setError('获取用户列表失败，请稍后再试');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 检查用户权限
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
      const response = await fetch('http://localhost:3002/api/points/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          ruleId: parseInt(ruleId),
          points: parseInt(points),
          description,
          operatorId: user.id // 操作人ID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '发放积分失败');
      }

      alert('积分发放成功！');
      
      // 重置表单
      setUserId('');
      setRuleId('');
      setPoints('');
      setDescription('');
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
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
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
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email}) - 当前积分: {user.total_points}
                </option>
              ))}
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