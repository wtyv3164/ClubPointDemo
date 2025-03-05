'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main className="pt-14 pl-64">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
      <footer className="pl-64 bg-white shadow-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} 校内社团积分系统. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-blue-500">关于我们</a>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-500">使用帮助</a>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-500">联系我们</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;