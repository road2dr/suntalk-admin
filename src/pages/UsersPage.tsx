import React, { useEffect, useCallback } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  Descriptions,
  message,
  Popconfirm,
  Avatar,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  BlockOutlined,
  UnlockOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useUsersStore } from '../stores/usersStore';
import AdminLayout from '../layouts/AdminLayout';

const { Search } = Input;

const SNS_FIELDS: { key: string; label: string; color: string }[] = [
  { key: 'kakao_id', label: '카카오', color: '#FFD600' },
  { key: 'naver_id', label: '네이버', color: '#03C75A' },
  { key: 'google_id', label: '구글', color: '#4285F4' },
  { key: 'apple_id', label: 'Apple', color: '#000' },
];

const GENDER_LABELS: Record<string, string> = {
  male: '남성',
  female: '여성',
  other: '기타',
};

const UsersPage: React.FC = () => {
  const {
    users, total, page, pageSize, loading,
    searchName, searchEmail,
    detailUser, detailModalOpen, blockLoading,
    setSearchName, setSearchEmail, setPage, setPageSize,
    setDetailModalOpen, fetchUsers, fetchUser, toggleBlock,
  } = useUsersStore();

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchUsers();
  }, [setPage, fetchUsers]);

  const handleToggleBlock = useCallback(async (userId: string, isBlocked: boolean) => {
    try {
      await toggleBlock(userId, isBlocked);
      message.success(isBlocked ? '차단이 해제되었습니다.' : '사용자가 차단되었습니다.');
    } catch {
      message.error('차단 설정 변경에 실패했습니다.');
    }
  }, [toggleBlock]);

  const handleViewDetail = useCallback(async (userId: string) => {
    try {
      await fetchUser(userId);
    } catch {
      message.error('사용자 정보를 불러오는데 실패했습니다.');
    }
  }, [fetchUser]);

  const columns = [
    {
      title: '썸네일',
      key: 'thumbnail',
      width: 50,
      render: (_: any, record: any) =>
        record.thumbnail_url ? (
          <Avatar size={32} src={record.thumbnail_url} />
        ) : (
          <Avatar size={32}>{(record.name || '?')[0]}</Avatar>
        ),
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '닉네임',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 100,
      render: (v: string | null) => v || '-',
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      width: 170,
      render: (v: string | null) => v || '-',
    },
    {
      title: '성별',
      dataIndex: 'gender',
      key: 'gender',
      width: 60,
      render: (v: string | null) => v ? GENDER_LABELS[v] || v : '-',
    },
    {
      title: '포인트',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      render: (v: number) => v?.toLocaleString() || '0',
    },
    {
      title: 'SNS 연동',
      key: 'sns',
      width: 160,
      render: (_: any, record: any) => {
        const linked = SNS_FIELDS.filter((f) => record[f.key as keyof typeof record]);
        if (linked.length === 0) return <span style={{ color: '#999' }}>없음</span>;
        return (
          <Space size={4}>
            {linked.map((f) => (
              <Tag key={f.key} color={f.color} style={{ color: f.key === 'kakao_id' ? '#000' : '#fff' }}>
                {f.label}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '로그인 상태',
      dataIndex: 'login_completed',
      key: 'login_completed',
      width: 110,
      render: (v: boolean) =>
        v ? (
          <Tag color="green">완료</Tag>
        ) : (
          <Tag color="orange" icon={<WarningOutlined />}>미완료</Tag>
        ),
    },
    {
      title: '계정 상태',
      dataIndex: 'is_blocked',
      key: 'is_blocked',
      width: 80,
      render: (v: boolean) =>
        v ? <Tag color="red">차단</Tag> : <Tag color="green">정상</Tag>,
    },
    {
      title: '가입일',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (v: string) => new Date(v).toLocaleString('ko-KR'),
    },
    {
      title: '관리',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          />
          <Popconfirm
            title={record.is_blocked ? '차단을 해제하시겠습니까?' : '사용자를 차단하시겠습니까?'}
            onConfirm={() => handleToggleBlock(record.id, record.is_blocked)}
          >
            <Button
              size="small"
              danger={record.is_blocked}
              type={record.is_blocked ? 'default' : 'primary'}
              icon={record.is_blocked ? <UnlockOutlined /> : <BlockOutlined />}
              loading={blockLoading === record.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getSnsValue = (user: any, key: string) => {
    return (user as any)[key] || null;
  };

  const renderSnsItem = (user: any, field: { key: string; label: string }) => {
    const val = getSnsValue(user, field.key);
    return (
      <Descriptions.Item label={field.label}>
        {val ? (
          <Tag color="blue">{val}</Tag>
        ) : (
          <span style={{ color: '#999' }}>미연동</span>
        )}
      </Descriptions.Item>
    );
  };

  return (
    <AdminLayout>
      <h2 style={{ marginTop: 0, marginBottom: 24 }}>사용자 관리</h2>
      <Space style={{ marginBottom: 16 }} size="middle">
        <Search
          placeholder="이름으로 검색"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 200 }}
          allowClear
        />
        <Search
          placeholder="이메일로 검색"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 250 }}
          allowClear
        />
        <Button icon={<SearchOutlined />} onClick={handleSearch} type="primary">
          검색
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `총 ${t}명`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        scroll={{ x: 1100 }}
      />

      <Modal
        title="사용자 상세 정보"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            닫기
          </Button>,
          detailUser && (
            <Button
              key="block"
              danger={detailUser.is_blocked}
              type={detailUser.is_blocked ? 'default' : 'primary'}
              onClick={() => {
                handleToggleBlock(detailUser.id, detailUser.is_blocked);
                setDetailModalOpen(false);
              }}
            >
              {detailUser.is_blocked ? '차단 해제' : '차단'}
            </Button>
          ),
        ]}
        width={640}
      >
        {detailUser && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{detailUser.id}</Descriptions.Item>
            <Descriptions.Item label="이름">{detailUser.name}</Descriptions.Item>
            <Descriptions.Item label="닉네임">
              {detailUser.nickname || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="이메일">
              {detailUser.email ? (
                detailUser.email
              ) : (
                <Tag color="orange" icon={<WarningOutlined />}>미입력</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="성별">
              {detailUser.gender ? GENDER_LABELS[detailUser.gender] || detailUser.gender : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="나이">
              {detailUser.age != null ? `${detailUser.age}세` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="주소(광역)">
              {detailUser.region_addr || '-'}
            </Descriptions.Item>
            {SNS_FIELDS.map((field) => renderSnsItem(detailUser, field))}
            <Descriptions.Item label="썸네일">
              {detailUser.thumbnail_url ? (
                <Space>
                  <Avatar size={48} src={detailUser.thumbnail_url} />
                  <a href={detailUser.thumbnail_url} target="_blank" rel="noreferrer">
                    링크
                  </a>
                </Space>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="배경 이미지">
              {detailUser.background_image_url ? (
                <a href={detailUser.background_image_url} target="_blank" rel="noreferrer">
                  보기
                </a>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="포인트">
              {detailUser.points?.toLocaleString() || '0'} P
            </Descriptions.Item>
            <Descriptions.Item label="로그인 상태">
              {detailUser.login_completed ? (
                <Tag color="green">완료</Tag>
              ) : (
                <Tag color="orange" icon={<WarningOutlined />}>로그인 미완료 (이메일 없음)</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="계정 상태">
              {detailUser.is_blocked ? (
                <Tag color="red">차단</Tag>
              ) : (
                <Tag color="green">정상</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="가입일">
              {new Date(detailUser.created_at).toLocaleString('ko-KR')}
            </Descriptions.Item>
            <Descriptions.Item label="수정일">
              {new Date(detailUser.updated_at).toLocaleString('ko-KR')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default UsersPage;