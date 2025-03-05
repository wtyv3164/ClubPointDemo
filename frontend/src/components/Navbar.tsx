'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input, Avatar, Dropdown } from 'antd';
import { SearchOutlined, UserOutlined, BellOutlined } from '@ant-design/icons';

const Navbar = () => {
  const [searchText, setSearchText] = useState('');

  const userMenuItems = [
    { key: 'profile', label: '个人中心' },
    { key: 'settings', label: '设置' },
    { key: 'logout', label: '退出登录' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/vercel.svg" alt="Logo" width={24} height={24} />
            <span className="text-lg font-semibold">社团积分系统</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/activities" className="text-gray-600 hover:text-blue-500">活动中心</Link>
            <Link href="/points" className="text-gray-600 hover:text-blue-500">积分排行</Link>
            <Link href="/clubs" className="text-gray-600 hover:text-blue-500">社团管理</Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Input
            placeholder="搜索活动"
            prefix={<SearchOutlined />}
            className="w-48 lg:w-64"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="p-2 text-gray-600 hover:text-blue-500">
            <BellOutlined className="text-xl" />
          </button>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <button className="flex items-center space-x-2 cursor-pointer">
              <Avatar icon={<UserOutlined />} />
              <span className="hidden md:inline text-gray-600">用户名</span>
            </button>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;