import React from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const { Sider } = Layout;

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  const menuItems = [
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '사용자',
    },
    {
      key: '/payments',
      icon: <DollarOutlined />,
      label: '결제 정보',
    },
  ];

  const selectedKey = menuItems.find((item) =>
    location.pathname.startsWith(item.key)
  )?.key || '/users';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        style={{
          background: '#001529',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          SunTalk Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, flex: 1 }}
        />
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: 'rgba(255,255,255,0.65)', width: '100%', justifyContent: 'flex-start' }}
          >
            로그아웃
          </Button>
        </div>
      </Sider>
      <Layout style={{ marginLeft: 220 }}>
        <Layout.Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 'calc(100vh - 48px)' }}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;