'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [searchText, setSearchText] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // 获取用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 监听点击事件，用于关闭下拉菜单
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // 清除本地存储中的用户信息
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    // 跳转到首页
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      {/* 导航条 */}
      <div className="h-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-pink-500 rounded-md flex items-center justify-center text-white font-bold">
                CP
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
                ClubPoint
              </span>
            </Link>

            {/* 主导航 */}
            <nav className="hidden md:flex space-x-6">
              <Link href="/activities" className="nav-link group relative">
                <span className="text-gray-700 group-hover:text-pink-500 transition-colors">活动中心</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/points" className="nav-link group relative">
                <span className="text-gray-700 group-hover:text-pink-500 transition-colors">积分中心</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              {user && user.role === 'admin' && (
                <Link href="/point-rules" className="nav-link group relative">
                  <span className="text-gray-700 group-hover:text-pink-500 transition-colors">规则管理</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* 搜索框 */}
            <div className="relative hidden sm:block">
              <input
                type="text"
                className="w-64 py-1.5 pl-10 pr-4 rounded-full border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none transition-colors"
                placeholder="搜索活动..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 消息通知 */}
            <button className="relative p-2 text-gray-700 hover:text-pink-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>

            {/* 用户信息/登录区域 */}
            {user ? (
              <div className="flex items-center">
                <div className="mr-3 hidden md:block">
                  <span className="block text-xs text-gray-500">{user.role === 'admin' ? '管理员' : '用户'}</span>
                  <span className="block text-sm font-medium text-gray-800">{user.username}</span>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button 
                    className="flex items-center space-x-1" 
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center text-white font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:flex items-center text-gray-700 hover:text-pink-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {/* 用户下拉菜单 */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
                      <div className="border-b border-gray-100 pb-2 pt-1 px-4">
                        <span className="block text-pink-500 font-medium">{user.totalPoints}</span>
                        <span className="block text-xs text-gray-500">积分</span>
                      </div>
                      <Link 
                        href="/points" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-pink-500"
                        onClick={() => setShowDropdown(false)}
                      >
                        积分明细
                      </Link>
                      <Link 
                        href="/user/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-pink-500"
                        onClick={() => setShowDropdown(false)}
                      >
                        个人中心
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-pink-500"
                      >
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/auth/login"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  登录
                </Link>
                <Link 
                  href="/auth/register"
                  className="bg-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-pink-600 transition-colors"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 二级导航 - 只在特定页面显示，可根据路由条件渲染 */}
      <div className="bg-white border-b border-gray-100 h-10 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex h-full items-center space-x-6">
            <Link href="/activities/trending" className="text-sm text-gray-600 hover:text-pink-500">热门活动</Link>
            <Link href="/activities/newest" className="text-sm text-gray-600 hover:text-pink-500">最新活动</Link>
            <Link href="/activities/recommended" className="text-sm text-gray-600 hover:text-pink-500">推荐活动</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;