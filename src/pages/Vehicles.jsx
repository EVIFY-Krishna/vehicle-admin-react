import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { Table, Button, Modal, Form, Input, Select, Typography, Space, Upload, Tag } from 'antd';
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDebounce } from '../hooks/useDebounce';

const { Title } = Typography;
const { Option } = Select;

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [fleets, setFleets] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    
    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [form] = Form.useForm();
    
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchVehicles();
        fetchFleets();
    }, [statusFilter, debouncedSearch]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            let url = `${API_URL}/vehicles?limit=50`;
            if (statusFilter) url += `&status=${statusFilter}`;
            if (debouncedSearch) url += `&keyword=${debouncedSearch}`;
            
            const { data } = await axios.get(url, config);
            setVehicles(data.vehicles);
        } catch (error) {
            console.error("Error fetching vehicles", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFleets = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_URL}/fleets`, config);
            setFleets(data);
        } catch (err) {
            console.error("Error fetching fleets", err);
        }
    };

    const showModal = (vehicle = null) => {
        if (vehicle) {
            setEditingId(vehicle._id);
            form.setFieldsValue({
                name: vehicle.name || '',
                description: vehicle.description || '',
                registrationNumber: vehicle.registrationNumber || '',
                model: vehicle.model || '',
                status: vehicle.status || 'active',
                fleetId: vehicle.fleet ? vehicle.fleet._id : ''
            });
            if (vehicle.images && vehicle.images.length > 0) {
                const initialFileList = vehicle.images.map((url, index) => ({
                    uid: `-${index}`,
                    name: `image-${index}`,
                    status: 'done',
                    url: url,
                }));
                setFileList(initialFileList);
            } else {
                setFileList([]);
            }
        } else {
            setEditingId(null);
            form.resetFields();
            form.setFieldsValue({ status: 'active' });
            setFileList([]);
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
            const config = { 
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            };
            
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('description', values.description || '');
            formData.append('registrationNumber', values.registrationNumber);
            formData.append('model', values.model);
            formData.append('status', values.status);
            formData.append('fleetId', values.fleetId);
            
            const existingImages = [];
            fileList.forEach(file => {
                if (file.url) {
                    existingImages.push(file.url);
                } else {
                    const fileToUpload = file.originFileObj || file;
                    if (fileToUpload instanceof File) {
                        formData.append('images', fileToUpload);
                    }
                }
            });

            if (editingId) {
                if (existingImages.length > 0) {
                    existingImages.forEach(url => formData.append('images', url));
                } else {
                    formData.append('clearExistingImages', 'true');
                }
            }

            if (editingId) {
                await axios.put(`${API_URL}/vehicles/${editingId}`, formData, config);
                toast.success("Vehicle updated successfully");
            } else {
                await axios.post(`${API_URL}/vehicles`, formData, config);
                toast.success("Vehicle created successfully");
            }
            
            setIsModalVisible(false);
            fetchVehicles();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this vehicle?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    await axios.delete(`${API_URL}/vehicles/${id}`, config);
                    toast.success("Vehicle deleted successfully");
                    fetchVehicles();
                } catch (error) {
                    toast.error(error.response?.data?.message || error.message);
                }
            }
        });
    };

    const handleStatusChange = async (newStatus, vehicleId) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            // Just update the status
            await axios.put(`${API_URL}/vehicles/${vehicleId}`, { status: newStatus }, config);
            toast.success("Status updated!");
            
            // Update local state without full refetch for snappy UI
            setVehicles(vehicles.map(v => v._id === vehicleId ? { ...v, status: newStatus } : v));
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating status");
        }
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            return false; // Prevent automatic upload
        },
        onChange: (info) => {
            setFileList(info.fileList);
        },
        fileList,
    };

    const columns = [
        {
            title: 'Vehicle',
            key: 'vehicle',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{record.name || 'Unnamed Vehicle'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{record.registrationNumber}</div>
                </div>
            )
        },
        {
            title: 'Model',
            dataIndex: 'model',
            key: 'model',
        },
        {
            title: 'Fleet',
            key: 'fleet',
            render: (_, record) => record.fleet ? record.fleet.name : 'Unassigned'
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                let color = record.status === 'active' ? 'success' : record.status === 'charging' ? 'warning' : 'error';
                return (
                    <Select 
                        value={record.status} 
                        onChange={(value) => handleStatusChange(value, record._id)}
                        variant="borderless"
                        style={{ width: 130 }}
                        popupMatchSelectWidth={false}
                    >
                        <Option value="active"><Tag color="success" style={{margin:0, width:'100%', textAlign:'center'}}>Active</Tag></Option>
                        <Option value="charging"><Tag color="warning" style={{margin:0, width:'100%', textAlign:'center'}}>Charging</Tag></Option>
                        <Option value="maintenance"><Tag color="error" style={{margin:0, width:'100%', textAlign:'center'}}>Maintenance</Tag></Option>
                    </Select>
                );
            }
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
                <Title level={2} style={{ margin: 0 }}>Vehicles Management</Title>
                <Button type="primary" onClick={() => showModal()}>
                    Add Vehicle
                </Button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                <div className="search-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Filter size={20} color="var(--text-muted)" />
                        <Select 
                            value={statusFilter} 
                            onChange={setStatusFilter} 
                            style={{ width: 150 }}
                        >
                            <Option value="">All Statuses</Option>
                            <Option value="active">Active</Option>
                            <Option value="charging">Charging</Option>
                            <Option value="maintenance">Maintenance</Option>
                        </Select>
                    </div>
                    
                    <Input.Search 
                        placeholder="Search by registration number" 
                        allowClear 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ width: 300 }} 
                    />
                </div>

                <Table 
                    columns={columns} 
                    dataSource={vehicles} 
                    rowKey="_id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    style={{ background: 'transparent' }}
                />
            </div>

            <Modal
                title={editingId ? 'Edit Vehicle' : 'Add Vehicle'}
                open={isModalVisible}
                onCancel={handleCancel}
                width={600}
                centered
                bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
                    <Button key="submit" type="primary" loading={submitLoading} onClick={() => form.submit()}>
                        {editingId ? 'Update Vehicle' : 'Save Vehicle'}
                    </Button>
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: '1.5rem' }}
                >
                    <Form.Item name="name" label="Vehicle Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Delivery Van A" />
                    </Form.Item>
                    
                    <Form.Item name="registrationNumber" label="Registration Number" rules={[{ required: true }]}>
                        <Input placeholder="e.g. NY-1234" />
                    </Form.Item>
                    
                    <Form.Item name="model" label="Model" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Ford E-Transit" />
                    </Form.Item>
                    
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} placeholder="Vehicle details..." />
                    </Form.Item>

                    <Form.Item name="fleetId" label="Assign to Fleet" rules={[{ required: true }]}>
                        <Select placeholder="Select a fleet">
                            {fleets.map(f => (
                                <Option key={f._id} value={f._id}>{f.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="status" label="Status">
                        <Select>
                            <Option value="active">Active</Option>
                            <Option value="charging">Charging</Option>
                            <Option value="maintenance">Maintenance</Option>
                        </Select>
                    </Form.Item>
                    
                    <Form.Item label="Vehicle Images">
                        <Upload {...uploadProps} listType="picture-card" multiple>
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Vehicles;
