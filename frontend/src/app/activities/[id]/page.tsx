'use client';

import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Modal, Form, Input, Rate, List, Avatar, Tag, message } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Activity {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  club_id: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  club_name?: string;
  current_participants?: number;
  created_at: string;
  updated_at: string;
  image_url?: string;
  point_value: number;
}

interface Registration {
  id: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  check_in_time: string | null;
  check_out_time: string | null;
}

interface Feedback {
  id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [user, setUser] = useState<any>(null);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityDetails();
    fetchRegistrationStatus();
    fetchFeedbacks();
    fetchUser();
  }, []);

  const fetchActivityDetails = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}`);
      const data = await response.json();
      setActivity(data);
    } catch (error) {
      message.error('获取活动详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationStatus = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}/registration`);
      const data = await response.json();
      setRegistration(data);
    } catch (error) {
      console.error('获取报名状态失败', error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}/feedbacks`);
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error('获取评价失败', error);
    }
  };

  const fetchUser = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        try {
          const registrationResponse = await fetch(`http://localhost:3002/api/registrations?user_id=${userData.id}&activity_id=${params.id}`);
          if (registrationResponse.ok) {
            const registrationData = await registrationResponse.json();
            if (registrationData && registrationData.length > 0) {
              setIsRegistered(true);
              setRegistrationStatus(registrationData[0].status || 'registered');
            }
          }
        } catch (error) {
          console.error('检查注册状态失败:', error);
        }
      }
      
      try {
        const participantsResponse = await fetch(`http://localhost:3002/api/activities/${params.id}/participants`);
        if (participantsResponse.ok) {
          const participantsData = await participantsResponse.json();
          if (activity) {
            activity.current_participants = participantsData.length;
          }
        }
      } catch (error) {
        console.error('获取报名人数失败:', error);
        if (activity) {
          activity.current_participants = 0;
        }
      }
    } catch (error) {
      console.error('获取用户信息失败', error);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    if (isRegistered) {
      setError('您已经报名了此活动');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setRegistering(true);
    
    try {
      const response = await fetch('http://localhost:3002/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          activity_id: activity?.id,
        }),
      });
      
      if (response.ok) {
        setSuccess('报名成功！您已成功报名参加此活动');
        setIsRegistered(true);
        setRegistrationStatus('registered');
        
        if (activity) {
          activity.current_participants = (activity.current_participants || 0) + 1;
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || '报名失败，请稍后再试');
      }
    } catch (error) {
      console.error('报名请求失败:', error);
      setError('报名请求失败，请检查网络连接');
    } finally {
      setRegistering(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}/check-in`, {
        method: 'POST',
      });
      if (response.ok) {
        message.success('签到成功');
        fetchRegistrationStatus();
      }
    } catch (error) {
      message.error('签到失败');
    }
  };

  const handleSubmitFeedback = async (values: any) => {
    try {
      const response = await fetch(`/api/activities/${params.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        message.success('评价提交成功');
        setIsModalVisible(false);
        form.resetFields();
        fetchFeedbacks();
      }
    } catch (error) {
      message.error('评价提交失败');
    }
  };

  if (!activity) return null;

  const getRegistrationStatusTag = () => {
    if (!registration) return null;
    const statusMap = {
      pending: { color: 'orange', text: '待审核' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已拒绝' },
      cancelled: { color: 'default', text: '已取消' },
    };
    const { color, text } = statusMap[registration.status];
    return <Tag color={color}>{text}</Tag>;
  };

  const remainingSpots = activity.max_participants - (activity.current_participants || 0);
  const isActivityFull = remainingSpots <= 0;
  const isActivityStarted = new Date(activity.start_time) <= new Date();
  const isActivityEnded = new Date(activity.end_time) < new Date();
  const canRegister = !isRegistered && !isActivityFull && !isActivityEnded && activity.status === 'active';

  return (
    <div className="p-6">
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <Card title={activity.title}>
        <Descriptions bordered>
          <Descriptions.Item label="活动描述">{activity.description}</Descriptions.Item>
          <Descriptions.Item label="开始时间">{new Date(activity.start_time).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="结束时间">{new Date(activity.end_time).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="地点">{activity.location}</Descriptions.Item>
          <Descriptions.Item label="最大参与人数">{activity.max_participants}</Descriptions.Item>
          <Descriptions.Item label="当前参与人数">{activity.current_participants ?? '0'}</Descriptions.Item>
          <Descriptions.Item label="报名状态">{getRegistrationStatusTag()}</Descriptions.Item>
        </Descriptions>

        <div className="mt-4 space-x-4">
          {!registration && (
            <Button type="primary" onClick={handleRegister}>立即报名</Button>
          )}
          {registration?.status === 'approved' && !registration.check_in_time && (
            <Button type="primary" onClick={handleCheckIn}>签到</Button>
          )}
          {registration?.status === 'approved' && registration.check_out_time && (
            <Button type="primary" onClick={() => setIsModalVisible(true)}>评价活动</Button>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">活动评价</h3>
          <List
            itemLayout="horizontal"
            dataSource={feedbacks}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>U</Avatar>}
                  title={<Rate disabled defaultValue={item.rating} />}
                  description={item.comment}
                />
                <div>{new Date(item.created_at).toLocaleDateString()}</div>
              </List.Item>
            )}
          />
        </div>

        <Modal
          title="活动评价"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={handleSubmitFeedback}>
            <Form.Item
              name="rating"
              label="评分"
              rules={[{ required: true, message: '请选择评分' }]}
            >
              <Rate />
            </Form.Item>
            <Form.Item
              name="comment"
              label="评价内容"
              rules={[{ required: true, message: '请输入评价内容' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item className="text-right">
              <Button type="primary" htmlType="submit">提交评价</Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}