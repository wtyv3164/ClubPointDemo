'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePointRulePage() {
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState('earn');
  const [actionType, setActionType] = useState('');
  const [points, setPoints] = useState('');
  const [exchangeRatio, setExchangeRatio] = useState('');
  const [validityDays, setValidityDays] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // 预定义的行为类型选项
  const actionTypes = [
    { value: 'activity_participation', label: '活动参与' },
    { value: 'new_user_invitation', label: '邀请新用户' },
    { value: 'daily_check_in', label: '每日签到' },
    { value: 'content_creation', label: '内容创作' },
    { value: 'points_exchange', label: '积分兑换' },
    { value: 'manual_adjustment', label: '手动调整' },
  ];

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
      alert('权限不足，只有管理员可以创建积分规则');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 检查用户权限
    if (!user || user.role !== 'admin') {
      setError('权限不足，只有管理员可以创建积分规则');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3002/api/point-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rule_name: ruleName,
          rule_type: ruleType,
          action_type: actionType,
          points: parseInt(points),
          exchange_ratio: exchangeRatio ? parseFloat(exchangeRatio) : null,
          validity_days: validityDays ? parseInt(validityDays) : null,
          description,
          is_active: isActive,
          userId: user.id // 传递用户ID用于权限验证和创建人记录
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '创建积分规则失败');
      }

      // 跳转到积分规则列表页
      router.push('/point-rules');
    } catch (err: any) {
      setError(err.message || '创建积分规则失败，请稍后再试');
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
      <h1 className="text-2xl font-bold mb-6">创建积分规则</h1>
      
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
            <label htmlFor="ruleName" className="block text-sm font-medium text-gray-700">
              规则名称
            </label>
            <input
              type="text"
              id="ruleName"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="ruleType" className="block text-sm font-medium text-gray-700">
              规则类型
            </label>
            <select
              id="ruleType"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value)}
            >
              <option value="earn">获取积分</option>
              <option value="consume">消耗积分</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="actionType" className="block text-sm font-medium text-gray-700">
              行为类型
            </label>
            <select
              id="actionType"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
            >
              <option value="">-- 选择行为类型 --</option>
              {actionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
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
          </div>
          
          <div className="space-y-2">
            <label htmlFor="exchangeRatio" className="block text-sm font-medium text-gray-700">
              兑换比例 (可选)
            </label>
            <input
              type="number"
              id="exchangeRatio"
              step="0.01"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={exchangeRatio}
              onChange={(e) => setExchangeRatio(e.target.value)}
            />
            <p className="text-xs text-gray-500">例如：1积分=多少元</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="validityDays" className="block text-sm font-medium text-gray-700">
              有效期(天) (可选)
            </label>
            <input
              type="number"
              id="validityDays"
              min="1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
            />
            <p className="text-xs text-gray-500">留空表示永久有效</p>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              规则描述
            </label>
            <textarea
              id="description"
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                立即启用
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="mr-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => router.push('/point-rules')}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? '创建中...' : '创建规则'}
          </button>
        </div>
      </form>
    </div>
  );
} 