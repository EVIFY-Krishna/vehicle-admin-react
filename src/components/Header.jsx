import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bell, Clock, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { Dropdown, Modal, Form, Input, Button, Upload, Avatar, Space } from 'antd';
import { UploadOutlined, LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const Header = ({ setSidebarOpen }) => {
    const { user, logout, updateUser } = useContext(AuthContext);
    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
    const [modalType, setModalType] = useState('profile');
    const [fileList, setFileList] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm();

    const openModal = (type) => {
        setModalType(type);
        form.setFieldsValue({
            name: user?.name,
            email: user?.email,
            password: ''
        });
        if (type === 'profile' && user?.profileImage) {
            setFileList([{
                uid: '-1',
                name: 'profile',
                status: 'done',
                url: user.profileImage,
            }]);
        } else {
            setFileList([]);
        }
        setIsProfileModalVisible(true);
    };

    const handleProfileSubmit = async (values) => {
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
            if (values.name) formData.append('name', values.name);
            if (values.email) formData.append('email', values.email);
            if (values.password) formData.append('password', values.password);

            if (fileList.length > 0) {
                // When beforeUpload returns false, fileList[0] is the raw File.
                // When already uploaded, originFileObj might exist.
                const fileToUpload = fileList[0].originFileObj || fileList[0];
                if (fileToUpload instanceof File) {
                    formData.append('profileImage', fileToUpload);
                }
            } else {
                formData.append('removeProfileImage', 'true');
            }

            const { data } = await axios.put(`${API_URL}/users/profile`, formData, config);

            updateUser(data);
            toast.success("Profile updated!");
            setIsProfileModalVisible(false);

        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const uploadProps = {
        onRemove: (file) => {
            setFileList([]);
        },
        beforeUpload: (file) => {
            return false; // Prevent auto upload
        },
        onChange: (info) => {
            setFileList(info.fileList);
        },
        fileList,
        maxCount: 1,
    };

    const items = [
        {
            key: '1',
            label: 'Profile Update',
            icon: <UserOutlined />,
            onClick: () => openModal('profile'),
        },
        {
            key: '2',
            label: 'Password Change',
            icon: <LockOutlined />,
            onClick: () => openModal('password'),
        },
        {
            type: 'divider',
        },
        {
            key: '3',
            label: 'Sign Out',
            icon: <LogOut size={16} />,
            onClick: logout,
            danger: true
        }
    ];

    return (
        <header style={{
            height: 'var(--header-height)',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            flexShrink: 0
        }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Button 
                    type="text" 
                    icon={<Menu size={20} />} 
                    onClick={() => setSidebarOpen(true)}
                    className="mobile-menu-btn"
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Dropdown menu={{ items }} placement="bottomRight" trigger={['hover']}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        {user?.profileImage ? (
                            <Avatar src={user.profileImage} />
                        ) : (
                            <Avatar style={{ backgroundColor: 'var(--accent)' }}>
                                {user?.name?.charAt(0)}
                            </Avatar>
                        )}
                    </div>
                </Dropdown>
            </div>

            <Modal
                title={modalType === 'password' ? "Change Password" : "Update Profile"}
                open={isProfileModalVisible}
                onCancel={() => setIsProfileModalVisible(false)}
                centered
                footer={[
                    <Button key="cancel" onClick={() => setIsProfileModalVisible(false)}>Cancel</Button>,
                    <Button key="submit" type="primary" loading={submitLoading} onClick={() => form.submit()}>
                        Save Changes
                    </Button>
                ]}
                bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleProfileSubmit}
                    style={{ marginTop: '1.5rem' }}
                >
                    {modalType === 'profile' && (
                        <>
                            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} placeholder="Admin Name" />
                            </Form.Item>
                            
                            <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                                <Input prefix={<MailOutlined />} placeholder="admin@evify.com" />
                            </Form.Item>

                            <Form.Item label="Profile Picture">
                                <Upload {...uploadProps} listType="picture-card" accept="image/*">
                                    <div>
                                        <UploadOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </>
                    )}

                    {modalType === 'password' && (
                        <Form.Item name="password" label="New Password" rules={[{ required: true, message: 'Please input your new password!' }]}>
                            <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </header>
    );
};

export default Header;
