'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChangeEmailPage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    currentEmail: '',
    newEmail: '',
    password: '',
    verificationCode: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 获取用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        currentEmail: userData.email || ''
      }));
      setLoading(false);
    } else {
      // 未登录，跳转到登录页
      router.push('/auth/login');
    }
  }, [router]);

  // 倒计时计时器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countDown > 0) {
      timer = setTimeout(() => {
        setCountDown(countDown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countDown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 发送验证码
  const sendVerificationCode = async () => {
    // 检查新邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.newEmail)) {
      setError('请输入有效的电子邮箱地址');
      return;
    }

    setError('');
    setSending(true);

    try {
      // 模拟API请求
      // 在实际项目中，应该调用后端API发送验证码
      // const response = await fetch(`http://localhost:3002/api/users/send-email-verification`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     userId: user.id,
      //     newEmail: formData.newEmail
      //   }),
      // });
      
      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.message || '发送验证码失败');
      // }

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCodeSent(true);
      setCountDown(60); // 设置60秒倒计时
      setSending(false);
    } catch (err: any) {
      console.error('发送验证码失败:', err);
      setError(err.message || '发送验证码失败，请稍后再试');
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 检查验证码是否已发送
    if (!codeSent) {
      setError('请先获取验证码');
      return;
    }
    
    // 检查验证码格式
    if (formData.verificationCode.length !== 6 || !/^\d+$/.test(formData.verificationCode)) {
      setError('请输入有效的6位数字验证码');
      return;
    }
    
    setSaving(true);

    try {
      // 模拟API请求
      // 在实际项目中，应该调用后端API进行邮箱更新
      // const response = await fetch(`http://localhost:3002/api/users/${user.id}/change-email`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     password: formData.password,
      //     newEmail: formData.newEmail,
      //     verificationCode: formData.verificationCode
      //   }),
      // });
      
      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.message || '更新失败');
      // }

      // 模拟成功响应和延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 更新本地存储中的用户信息
      const updatedUser = { ...user, email: formData.newEmail };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('邮箱已成功更新！');
      setSaving(false);
      
      // 3秒后重定向回个人主页
      setTimeout(() => {
        router.push('/user/profile');
      }, 2000);
    } catch (err: any) {
      console.error('更新邮箱失败:', err);
      setError(err.message || '更新邮箱时出错，请稍后再试');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">修改邮箱</h1>
        <p className="text-gray-600">更新您的联系邮箱</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
        <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto">
          <div className="space-y-6">
            <div>
              <label htmlFor="currentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                当前邮箱
              </label>
              <input
                type="email"
                id="currentEmail"
                name="currentEmail"
                value={formData.currentEmail}
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 sm:text-sm"
                disabled
              />
            </div>

            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                新邮箱
              </label>
              <div className="flex">
                <input
                  type="email"
                  id="newEmail"
                  name="newEmail"
                  value={formData.newEmail}
                  onChange={handleChange}
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                  required
                  disabled={codeSent}
                />
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={sending || countDown > 0 || codeSent && formData.verificationCode.length === 6}
                  className={`inline-flex items-center px-4 py-2 border border-l-0 rounded-r-md text-sm font-medium shadow-sm focus:outline-none ${
                    sending || countDown > 0 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-pink-600 text-white hover:bg-pink-700'
                  }`}
                >
                  {sending 
                    ? <span>发送中...</span> 
                    : countDown > 0 
                      ? <span>{countDown}秒后重试</span> 
                      : <span>获取验证码</span>
                  }
                </button>
              </div>
            </div>

            {codeSent && (
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  验证码
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                  placeholder="请输入6位数字验证码"
                  maxLength={6}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  验证码已发送至新邮箱，有效期为10分钟
                </p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                当前密码
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                为了保障账户安全，请输入当前密码
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Link 
                href="/user/profile"
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={saving || !codeSent}
                className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                  saving || !codeSent
                    ? 'bg-pink-400 cursor-not-allowed' 
                    : 'bg-pink-600 hover:bg-pink-700'
                }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    更新中...
                  </>
                ) : '更新邮箱'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 