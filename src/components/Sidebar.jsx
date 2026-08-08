import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, LogOut, Users, MapPin } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { logout } = useContext(AuthContext);

    return (
        <div className={`app-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: '250px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Truck size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)', lineHeight: 1.2 }}>EVIFY Admin</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Global Logistics</div>
                    </div>
                </div>
            </div>
            
            <nav style={{ padding: '1.5rem 1rem', flex: 1 }}>
                <NavLink 
                    to="/" 
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    end
                    onClick={() => setSidebarOpen(false)}
                >
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink 
                    to="/fleets" 
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    onClick={() => setSidebarOpen(false)}
                >
                    <MapPin size={20} /> Fleets
                </NavLink>
                <NavLink 
                    to="/vehicles" 
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    onClick={() => setSidebarOpen(false)}
                >
                    <Truck size={20} /> Vehicles
                </NavLink>
                <NavLink 
                    to="/users" 
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    onClick={() => setSidebarOpen(false)}
                >
                    <Users size={20} /> Users
                </NavLink>
            </nav>

            <div style={{ padding: '1rem' }}>
                <button 
                    onClick={logout} 
                    className="logout-link" 
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
