'use client';

import Link from 'next/link';
import { Menu } from 'antd';
import {
  AppstoreOutlined,
  TrophyOutlined,
  TeamOutlined,
  CalendarOutlined,
  SettingOutlined
} from '@ant-design/icons';

const Sidebar = () => {
  const menuItems = [
    {
      key: 'dashboard',
      icon: <AppstoreOutlined />,
      label: <Link href="/dashboard">仪表盘</Link>
    },
    {
      key: 'activities',
      icon: <CalendarOutlined />,
      label: <Link href="/activities">活动管理</Link>,
      children: [
        {
          key: 'activities-list',
          label: <Link href="/activities">活动列表</Link>
        },
        {
          key: 'activities-create',
          label: <Link href="/activities/create">创建活动</Link>
        }
      ]
    },
    {
      key: 'points',
      icon: <TrophyOutlined />,
      label: <Link href="/points">积分中心</Link>,
      children: [
        {
          key: 'points-ranking',
          label: <Link href="/points/ranking">积分排行</Link>
        },
        {
          key: 'points-history',
          label: <Link href="/points/history">积分记录</Link>
        }
      ]
    },
    {
      key: 'clubs',
      icon: <TeamOutlined />,
      label: <Link href="/clubs">社团管理</Link>,
      children: [
        {
          key: 'clubs-list',
          label: <Link href="/clubs">社团列表</Link>
        },
        {
          key: 'clubs-members',
          label: <Link href="/clubs/members">成员管理</Link>
        }
      ]
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">系统设置</Link>
    }
  ];

  return (
    <div className="fixed left-0 top-14 bottom-0 w-64 bg-white shadow-sm overflow-y-auto">
      <Menu
        mode="inline"
        defaultSelectedKeys={['dashboard']}
        defaultOpenKeys={['activities', 'points', 'clubs']}
        items={menuItems}
        className="h-full border-r"
      />
    </div>
  );
};

export default Sidebar;