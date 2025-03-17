import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '社活星云 - ClubPoint',
  description: '参与活动，获取积分，兑换奖励，提升你的校园生活体验！',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        {/* 顶部导航栏 */}
        <Navbar />
        
        {/* 主内容区 */}
        <div className="flex flex-1 pt-16 md:pt-26">
          {/* 侧边栏 */}
          <Sidebar />
          
          {/* 主要内容 */}
          <main className="flex-1 ml-16 md:ml-56">
            {children}
          </main>
        </div>
        
        {/* 全局页脚 */}
        <div className="ml-16 md:ml-56">
          <Footer />
        </div>
      </body>
    </html>
  );
}
