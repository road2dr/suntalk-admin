import React, { useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Descriptions,
  message,
  Select,
  DatePicker,
} from 'antd';
import {
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { usePaymentsStore } from '../stores/paymentsStore';
import AdminLayout from '../layouts/AdminLayout';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: '신용카드',
  kakao_pay: '카카오페이',
  naver_pay: '네이버페이',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  bank_transfer: '계좌이체',
  other: '기타',
};

const PURPOSE_LABELS: Record<string, string> = {
  subscription: '구독',
  item_purchase: '아이템 구매',
  gift: '선물',
  donation: '도네이션',
  coin_purchase: '코인 구매',
  other: '기타',
};

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: '대기', color: 'orange' },
  completed: { text: '완료', color: 'green' },
  failed: { text: '실패', color: 'red' },
  refunded: { text: '환불', color: 'blue' },
};

const PaymentsPage: React.FC = () => {
  const {
    payments, total, page, pageSize, loading,
    filterMethod, filterPurpose, dateRange,
    detailPayment, detailModalOpen,
    setFilterMethod, setFilterPurpose, setDateRange,
    setPage, setPageSize, setDetailModalOpen,
    fetchPayments, fetchPayment, resetFilters,
  } = usePaymentsStore();

  useEffect(() => {
    fetchPayments();
  }, [page, pageSize]);

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchPayments();
  }, [setPage, fetchPayments]);

  const handleViewDetail = useCallback(async (paymentId: string) => {
    try {
      await fetchPayment(paymentId);
    } catch {
      message.error('결제 상세 정보를 불러오는데 실패했습니다.');
    }
  }, [fetchPayment]);

  const columns = [
    {
      title: '사용자',
      key: 'user',
      width: 120,
      render: (_: any, record: any) =>
        record.user_nickname || record.user_name || '-',
    },
    {
      title: '이메일',
      key: 'user_email',
      width: 180,
      render: (_: any, record: any) => record.user_email || '-',
    },
    {
      title: '결제 금액',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (v: number) => `₩${v.toLocaleString()}`,
    },
    {
      title: '결제 수단',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 100,
      render: (v: string) => PAYMENT_METHOD_LABELS[v] || v,
    },
    {
      title: '용도',
      dataIndex: 'purpose',
      key: 'purpose',
      width: 100,
      render: (v: string) => PURPOSE_LABELS[v] || v,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v: string) => {
        const label = STATUS_LABELS[v] || { text: v, color: 'default' };
        return <Tag color={label.color}>{label.text}</Tag>;
      },
    },
    {
      title: '결제일',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (v: string) => new Date(v).toLocaleString('ko-KR'),
    },
    {
      title: '관리',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)}
        />
      ),
    },
  ];

  return (
    <AdminLayout>
      <h2 style={{ marginTop: 0, marginBottom: 24 }}>결제 정보 관리</h2>
      <Space style={{ marginBottom: 16 }} wrap size="middle">
        <Select
          placeholder="결제 수단"
          value={filterMethod}
          onChange={setFilterMethod}
          allowClear
          style={{ width: 140 }}
          options={Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => ({
            value: k,
            label: v,
          }))}
        />
        <Select
          placeholder="결제 용도"
          value={filterPurpose}
          onChange={setFilterPurpose}
          allowClear
          style={{ width: 140 }}
          options={Object.entries(PURPOSE_LABELS).map(([k, v]) => ({
            value: k,
            label: v,
          }))}
        />
        <RangePicker
          value={dateRange as any}
          onChange={(dates) => {
            if (dates) {
              setDateRange([dates?.[0]?.toISOString() || null, dates?.[1]?.toISOString() || null]);
            } else {
              setDateRange(null);
            }
          }}
          placeholder={['시작일', '종료일']}
        />
        <Button icon={<EyeOutlined />} onClick={handleSearch} type="primary">
          검색
        </Button>
        <Button icon={<ReloadOutlined />} onClick={() => {
          resetFilters();
          setTimeout(fetchPayments, 0);
        }}>
          초기화
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `총 ${t}건`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title="결제 상세 정보"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={<Button onClick={() => setDetailModalOpen(false)}>닫기</Button>}
        width={600}
      >
        {detailPayment && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="결제 ID">{detailPayment.id}</Descriptions.Item>
            <Descriptions.Item label="사용자">
              {detailPayment.user_nickname || detailPayment.user_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="사용자 이메일">
              {detailPayment.user_email || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="결제 금액">
              ₩{detailPayment.amount.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="결제 수단">
              {PAYMENT_METHOD_LABELS[detailPayment.payment_method] ||
                detailPayment.payment_method}
            </Descriptions.Item>
            <Descriptions.Item label="결제 용도">
              {PURPOSE_LABELS[detailPayment.purpose] || detailPayment.purpose}
            </Descriptions.Item>
            <Descriptions.Item label="설명">
              {detailPayment.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="상태">
              {(() => {
                const label = STATUS_LABELS[detailPayment.status] || {
                  text: detailPayment.status,
                  color: 'default',
                };
                return <Tag color={label.color}>{label.text}</Tag>;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="결제일">
              {new Date(detailPayment.created_at).toLocaleString('ko-KR')}
            </Descriptions.Item>
            <Descriptions.Item label="수정일">
              {new Date(detailPayment.updated_at).toLocaleString('ko-KR')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default PaymentsPage;