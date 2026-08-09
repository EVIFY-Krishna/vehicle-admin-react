import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Users as UsersIcon } from 'lucide-react';
import { Table, Tag, Typography, Space, Input } from 'antd';
import { useDebounce } from '../hooks/useDebounce';

const { Title, Text } = Typography;

const Users = () => {
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);

    const fetchUsers = React.useCallback(async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_URL}/users`, config);
            setUsersList(data);
        } catch (err) {
            console.error("Error fetching users", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (!socket) return;
        const handleDataUpdated = (data) => {
            if (data.entity === 'user') fetchUsers();
        };
        socket.on('data-updated', handleDataUpdated);
        return () => socket.off('data-updated', handleDataUpdated);
    }, [socket, fetchUsers]);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    {record.profileImage ? (
                        <img 
                            src={record.profileImage} 
                            alt={text} 
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                    ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                            {text ? text.charAt(0).toUpperCase() : '?'}
                        </div>
                    )}
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color="blue">{role ? role.name : 'Unknown'}</Tag>
            ),
        },
        {
            title: 'Joined',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
        },
    ];

    return (
        <div>
            <div className="page-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Title level={2} style={{ margin: 0 }}>Users Management</Title>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                <div className="search-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <UsersIcon size={20} color="var(--text-muted)" />
                        <span style={{ color: 'var(--text-muted)' }}>Operators in the system</span>
                    </div>
                    <Input.Search 
                        placeholder="Search by name or email" 
                        allowClear 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ width: 300 }} 
                    />
                </div>

                <Table 
                    columns={columns} 
                    dataSource={usersList.filter(u => 
                        u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                        u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
                    )} 
                    rowKey="_id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    style={{ background: 'transparent' }}
                />
            </div>
        </div>
    );
};

export default Users;
