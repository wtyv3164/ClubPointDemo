'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PointRule {
  id: number;
  rule_name: string;
  rule_type: 'earn' | 'consume';
  action_type: string;
  points: number;
  exchange_ratio: number | null;
  validity_days: number | null;
  description: string;
  is_active: boolean;
  created_at: string;
  created_by: number;
  created_by_name: string;
}

export default function PointRulesPage() {
  const [rules, setRules] = useState<PointRule[]>([]);
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
    
    // 获取积分规则列表
    const fetchRules = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3002/api/point-rules');
        
        if (!response.ok) {
          throw new Error('获取积分规则列表失败');
        }
        
        const data = await response.json();
        setRules(data);
      } catch (err: any) {
        setError(err.message || '获取积分规则列表失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRules();
  }, []);

  const handleToggleStatus = async (ruleId: number, isActive: boolean) => {
    if (!user || user.role !== 'admin') {
      alert('权限不足，只有管理员可以修改规则状态');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3002/api/point-rules/${ruleId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !isActive,
          userId: user.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '更新规则状态失败');
      }
      
      // 更新规则状态
      setRules(rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, is_active: !isActive } 
          : rule
      ));
      
      alert(isActive ? '规则已禁用' : '规则已启用');
    } catch (err: any) {
      alert(err.message || '更新规则状态失败，请稍后再试');
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
        <h1 className="text-2xl font-bold">积分规则管理</h1>
        {user && user.role === 'admin' && (
          <Link 
            href="/point-rules/create"
            className="rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
          >
            创建规则
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
      
      {rules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无积分规则数据</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  规则名称
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  行为类型
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  积分值
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  有效期(天)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建人
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rule.rule_name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{rule.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rule.rule_type === 'earn' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {rule.rule_type === 'earn' ? '获取' : '消耗'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.action_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.validity_days || '永久'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.is_active ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(rule.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.created_by_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      href={`/point-rules/${rule.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      详情
                    </Link>
                    {user && user.role === 'admin' && (
                      <>
                        <Link 
                          href={`/point-rules/${rule.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(rule.id, rule.is_active)}
                          className={`${
                            rule.is_active 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {rule.is_active ? '禁用' : '启用'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 