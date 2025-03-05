'use client';

import { useState, useEffect } from 'react';
import { Input, Card, List, Button, Tag, Space, message } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface Activity {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
}

export default function Home() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      message.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchText.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStatusTag = (status: Activity['status']) => {
    const statusMap = {
      draft: { color: 'default', text: '草稿' },
      published: { color: 'green', text: '进行中' },
      cancelled: { color: 'red', text: '已取消' },
      completed: { color: 'blue', text: '已结束' }
    };
    const { color, text } = statusMap[status];
    return <Tag color={color}>{text}</Tag>;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <Input
          placeholder="搜索活动..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={e => setSearchText(e.target.value)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/activities/create')}
        >
          创建活动
        </Button>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={filteredActivities}
        loading={loading}
        renderItem={activity => (
          <List.Item>
            <Card
              hoverable
              onClick={() => router.push(`/activities/${activity.id}`)}
              title={
                <div className="flex justify-between items-center">
                  <span className="truncate">{activity.title}</span>
                  {getStatusTag(activity.status)}
                </div>
              }
            >
              <p className="mb-2 text-gray-600 truncate">{activity.description}</p>
              <Space direction="vertical" size="small" className="w-full">
                <div className="flex justify-between">
                  <span>开始时间：</span>
                  <span>{new Date(activity.start_time).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>地点：</span>
                  <span className="truncate">{activity.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>参与人数：</span>
                  <span>{activity.max_participants}人</span>
                </div>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}
