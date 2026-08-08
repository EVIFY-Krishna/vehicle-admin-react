import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Truck, Navigation, Zap, Wrench, Download } from 'lucide-react';
import { Card, Row, Col, Typography, Progress, Tag, Button } from 'antd';

const { Title, Text } = Typography;

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, active: 0, charging: 0, maintenance: 0 });
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_URL}/vehicles?limit=100`, config);

                const vehicles = data.vehicles || [];
                setStats({
                    total: vehicles.length,
                    active: vehicles.filter(v => v.status === 'active').length,
                    charging: vehicles.filter(v => v.status === 'charging').length,
                    maintenance: vehicles.filter(v => v.status === 'maintenance').length
                });
            } catch (error) {
                console.error("Error fetching vehicles for stats", error);
            }
        };

        fetchVehicles();
    }, [user]);

    // Derived values for the UI mockup
    const activePercent = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
    const chargingPercent = stats.total > 0 ? Math.round((stats.charging / stats.total) * 100) : 0;
    const maintenancePercent = stats.total > 0 ? Math.round((stats.maintenance / stats.total) * 100) : 0;

    return (
        <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                        Good Morning, {user?.name || 'User'}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '1rem' }}>
                        Here is the status of your fleet for today.
                    </Text>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <Text style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>TOTAL VEHICLES</Text>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Truck size={18} color="#2563eb" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>{stats.total.toLocaleString()}</Title>
                            <Progress type="circle" percent={100} size={55} strokeColor="#2563eb" format={(percent) => <span style={{ color: '#1f2937' }}>{percent}%</span>} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Tag color="success" style={{ margin: 0, borderRadius: 12, fontWeight: 600 }}>+12%</Tag>
                            <Text type="secondary" style={{ fontSize: '0.85rem' }}>vs last month</Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <Text style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>ACTIVE NOW</Text>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Navigation size={18} color="#10b981" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>{stats.active.toLocaleString()}</Title>
                            <Progress type="circle" percent={activePercent} size={55} strokeColor="#10b981" format={(percent) => <span style={{ color: '#1f2937' }}>{percent}%</span>} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Tag color="success" style={{ margin: 0, borderRadius: 12, fontWeight: 600 }}>{activePercent}%</Tag>
                            <Text type="secondary" style={{ fontSize: '0.85rem' }}>utilization</Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <Text style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>CHARGING</Text>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Zap size={18} color="#3b82f6" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>{stats.charging.toLocaleString()}</Title>
                            <Progress type="circle" percent={chargingPercent} size={55} strokeColor="#3b82f6" format={(percent) => <span style={{ color: '#1f2937' }}>{percent}%</span>} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: '0.9rem' }}>Avg duration: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>42m</span></Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <Text style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>MAINTENANCE</Text>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Wrench size={18} color="#ef4444" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>{stats.maintenance.toLocaleString()}</Title>
                            <Progress type="circle" percent={maintenancePercent} size={55} strokeColor="#ef4444" format={(percent) => <span style={{ color: '#1f2937' }}>{percent}%</span>} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Tag color="error" style={{ borderRadius: 12, margin: 0, fontWeight: 500 }}>
                                <span style={{ color: '#b91c1c' }}>⚠ 0 Critical</span>
                            </Tag>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
