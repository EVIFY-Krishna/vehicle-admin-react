import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { Table, Button, Modal, Form, Input, Typography, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDebounce } from '../hooks/useDebounce';

const { Title, Text } = Typography;

const Fleets = () => {
    const [fleets, setFleets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);

    const fetchFleets = React.useCallback(async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_URL}/fleets`, config);
            setFleets(data);
        } catch (err) {
            console.error("Error fetching fleets", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchFleets();
    }, [fetchFleets]);

    useEffect(() => {
        if (!socket) return;
        const handleDataUpdated = (data) => {
            if (data.entity === 'fleet') fetchFleets();
        };
        socket.on('data-updated', handleDataUpdated);
        return () => socket.off('data-updated', handleDataUpdated);
    }, [socket, fetchFleets]);

    const showModal = (fleet = null) => {
        if (fleet) {
            setEditingId(fleet._id);
            form.setFieldsValue({ name: fleet.name });
        } else {
            setEditingId(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSubmit = async (values) => {
        setSubmitLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            if (editingId) {
                await axios.put(`${API_URL}/fleets/${editingId}`, values, config);
                toast.success("Fleet updated successfully");
            } else {
                await axios.post(`${API_URL}/fleets`, values, config);
                toast.success("Fleet created successfully");
            }
            
            setIsModalVisible(false);
            fetchFleets();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this fleet?',
            content: 'All vehicles related to this fleet will also be deleted permanently.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    await axios.delete(`${API_URL}/fleets/${id}`, config);
                    toast.success("Fleet and related vehicles deleted successfully");
                    fetchFleets();
                } catch (error) {
                    toast.error(error.response?.data?.message || error.message);
                }
            }
        });
    };

    const columns = [
        {
            title: 'Fleet Name',
            dataIndex: 'name',
            key: 'name',
            render: text => <Text strong>{text}</Text>,
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: date => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
                        Edit
                    </Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="page-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Title level={2} style={{ margin: 0 }}>Fleets Management</Title>
                <Button type="primary" onClick={() => showModal()}>
                    Add Fleet
                </Button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                <div className="search-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <MapPin size={20} color="var(--text-muted)" />
                        <span style={{ color: 'var(--text-muted)' }}>Manage all vehicle fleets</span>
                    </div>
                    <Input.Search 
                        placeholder="Search fleets by name" 
                        allowClear 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ width: 300 }} 
                    />
                </div>

                <Table 
                    columns={columns} 
                    dataSource={fleets.filter(f => f.name.toLowerCase().includes(debouncedSearch.toLowerCase()))} 
                    rowKey="_id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    style={{ background: 'transparent' }}
                />
            </div>

            <Modal
                title={editingId ? 'Edit Fleet' : 'Add Fleet'}
                open={isModalVisible}
                onCancel={handleCancel}
                centered
                footer={[
                    <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
                    <Button key="submit" type="primary" loading={submitLoading} onClick={() => form.submit()}>
                        {editingId ? 'Update Fleet' : 'Save Fleet'}
                    </Button>
                ]}
                bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: '1.5rem' }}
                >
                    <Form.Item
                        name="name"
                        label="Fleet Name"
                        rules={[{ required: true, message: 'Please input the fleet name!' }]}
                    >
                        <Input placeholder="Enter fleet name" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Fleets;
