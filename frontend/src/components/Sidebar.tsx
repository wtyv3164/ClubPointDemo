'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // 获取用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <aside className={`fixed left-0 top-16 bottom-0 bg-white border-r border-gray-100 shadow-sm z-40 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-56'
    }`}>
      {/* 折叠按钮 */}
      <button 
        className="absolute -right-3 top-4 bg-white border border-gray-200 rounded-full p-1 shadow-sm text-gray-400 hover:text-pink-500"
        onClick={() => setCollapsed(!collapsed)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="py-4 h-full flex flex-col">
        {/* 顶部标题 */}
        <div className={`px-4 mb-6 ${collapsed ? 'text-center' : ''}`}>
          {!collapsed ? (
            <h2 className="text-base font-semibold text-gray-800">社活星云</h2>
          ) : (
            <div className="w-8 h-8 mx-auto bg-gradient-to-r from-pink-500 to-blue-600 rounded-md flex items-center justify-center text-white font-bold">
              CP
            </div>
          )}
        </div>
        
        {/* 主要导航菜单 */}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          <div className="mb-4">
            <p className={`text-xs font-medium text-gray-400 mb-2 ${collapsed ? 'text-center px-0' : 'px-3'}`}>
              {collapsed ? '···' : '主导航'}
            </p>
            
            <Link 
              href="/"
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mb-1 ${
                isActive('/') && !isActive('/activities') && !isActive('/points') && !isActive('/point-rules')
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-pink-500'
              }`}
            >
              <div className={`mr-3 p-1 rounded-md ${
                isActive('/') && !isActive('/activities') && !isActive('/points') && !isActive('/point-rules')
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-gray-500 group-hover:text-pink-500'
              }`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              {!collapsed && <span>首页</span>}
            </Link>
            
            <Link 
              href="/activities"
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mb-1 ${
                isActive('/activities')
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-pink-500'
              }`}
            >
              <div className={`mr-3 p-1 rounded-md ${
                isActive('/activities')
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-gray-500 group-hover:text-pink-500'
              }`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {!collapsed && <span>活动管理</span>}
            </Link>
            
            {user && user.role === 'admin' && !collapsed && (
              <Link 
                href="/activities/create"
                className={`flex items-center pl-10 pr-3 py-2 text-sm font-medium rounded-lg mb-1 ${
                  isActive('/activities/create')
                    ? 'bg-pink-50 text-pink-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-pink-500'
                }`}
              >
                <span>创建活动</span>
              </Link>
            )}
          </div>
          
          <div className="mb-4">
            <p className={`text-xs font-medium text-gray-400 mb-2 ${collapsed ? 'text-center px-0' : 'px-3'}`}>
              {collapsed ? '···' : '积分中心'}
            </p>
            
            <Link 
              href="/points"
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mb-1 ${
                isActive('/points')
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-pink-500'
              }`}
            >
              <div className={`mr-3 p-1 rounded-md ${
                isActive('/points')
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-gray-500 group-hover:text-pink-500'
              }`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {!collapsed && <span>积分中心</span>}
            </Link>
            
            {user && user.role === 'admin' && !collapsed && (
              <Link 
                href="/points/award"
                className={`flex items-center pl-10 pr-3 py-2 text-sm font-medium rounded-lg mb-1 ${
                  isActive('/points/award')
                    ? 'bg-pink-50 text-pink-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-pink-500'
                }`}
              >
                <span>发放积分</span>
              </Link>
            )}
            
            {user && user.role === 'admin' && (
              <Link 
                href="/point-rules"
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mb-1 ${
                  isActive('/point-rules')
                    ? 'bg-pink-50 text-pink-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-pink-500'
                }`}
              >
                <div className={`mr-3 p-1 rounded-md ${
                  isActive('/point-rules')
                    ? 'bg-pink-100 text-pink-600'
                    : 'text-gray-500 group-hover:text-pink-500'
                }`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                {!collapsed && <span>积分规则</span>}
              </Link>
            )}
          </div>
        </nav>
        
        {/* 底部用户区或登录区 */}
        <div className="mt-auto border-t border-gray-100 pt-4 px-3">
          {!user ? (
            <div className={`space-y-2 ${collapsed ? 'text-center' : ''}`}>
              {!collapsed && <p className="text-xs text-gray-500 mb-2">尚未登录</p>}
              <Link 
                href="/auth/login"
                className={`flex items-center justify-${collapsed ? 'center' : 'start'} px-2 py-2 text-sm font-medium rounded-md text-pink-600 hover:bg-pink-50`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {!collapsed && <span className="ml-2">登录</span>}
              </Link>
            </div>
          ) : (
            <div className={`flex ${collapsed ? 'justify-center' : 'items-center'}`}>
              {!collapsed ? (
                <>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center text-white font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-700">{user.username}</div>
                    <div className="text-xs text-pink-500">{user.totalPoints} 积分</div>
                  </div>
                </>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center text-white font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;