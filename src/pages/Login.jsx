import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { BatteryCharging } from 'lucide-react';
import { toast } from 'react-toastify';

const { Title, Text, Link } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await login(values.email, values.password);
            navigate('/');
        } catch (err) {
            toast.error(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%)',
            padding: '2rem'
        }}>
            <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* Logo Area */}
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'var(--accent)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto',
                        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
                    }}>
                        <BatteryCharging size={32} color="white" />
                    </div>
                    <Title level={2} style={{ margin: 0, color: '#1e3a8a', fontWeight: 700 }}>EVIFY Admin</Title>
                    <Text style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Operational Command Center</Text>
                </div>

                {/* Login Card */}
                <div style={{
                    background: '#ffffff',
                    padding: '2.5rem',
                    borderRadius: '16px',
                    width: '100%',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)'
                }}>
                    <Form
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            label={<Text style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>EMAIL ADDRESS</Text>}
                            rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Valid email required' }]}
                            style={{ marginBottom: '1rem' }}
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: 'var(--text-muted)', marginRight: '8px' }} />}
                                placeholder="admin@evify.fleet"
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <Text style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PASSWORD</Text>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please enter your password' }]}
                            style={{ marginBottom: '1rem' }}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: 'var(--text-muted)', marginRight: '8px' }} />}
                                placeholder="••••••••"
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Item>

                        <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: '1.25rem' }}>
                            <Checkbox><Text style={{ color: 'var(--text-muted)' }}>Remember device</Text></Checkbox>
                        </Form.Item>

                        <Form.Item style={{ marginBottom: '1.25rem' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                style={{
                                    height: '48px',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                Login to Dashboard <ArrowRightOutlined />
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                            <Text style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Need administrative access? <Link>Contact IT Support</Link>
                            </Text>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Login;
