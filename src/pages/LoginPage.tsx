import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('로그인에 성공했습니다.');
      window.location.href = '/users';
    } catch (error: any) {
      message.error(
        error.response?.data?.detail || '로그인에 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card title="SunTalk 관리자 로그인" style={{ width: 400 }}>
        <Form onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '아이디를 입력해주세요.' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="아이디" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              로그인
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;