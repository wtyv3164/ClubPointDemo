'use client';

import { useState } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import type { Dayjs } from 'dayjs';

interface ActivityFormData {
  title: string;
  description: string;
  start_time: Dayjs;
  end_time: Dayjs;
  location: string;
  max_participants: number;
}

export default function CreateActivityPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: ActivityFormData) => {
    setLoading(true);
    try {
      const formData = {
        ...values,
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        club_id: 1, // 添加默认的club_id用于测试
      };

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        message.success('活动创建成功');
        router.push('/activities');
      } else {
        throw new Error('创建失败');
      }
    } catch (error) {
      message.error('活动创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card title="创建活动">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="活动名称"
            name="title"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input placeholder="请输入活动名称" />
          </Form.Item>

          <Form.Item
            label="活动描述"
            name="description"
            rules={[{ required: true, message: '请输入活动描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入活动描述" />
          </Form.Item>

          <Form.Item
            label="开始时间"
            name="start_time"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择开始时间"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="结束时间"
            name="end_time"
            rules={[{ required: true, message: '请选择结束时间' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择结束时间"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="活动地点"
            name="location"
            rules={[{ required: true, message: '请输入活动地点' }]}
          >
            <Input placeholder="请输入活动地点" />
          </Form.Item>

          <Form.Item
            label="最大参与人数"
            name="max_participants"
            rules={[{ required: true, message: '请输入最大参与人数' }]}
          >
            <InputNumber
              min={1}
              placeholder="请输入最大参与人数"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item className="text-right">
            <Button type="default" onClick={() => router.back()} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              创建活动
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}