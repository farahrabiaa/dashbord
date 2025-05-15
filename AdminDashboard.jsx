import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import TopBar from './TopBar/TopBar';
import Overview from './Pages/Overview';
import Products from './Pages/Products';
import ProductsManagement from './Pages/ProductsManagement';
import Categories from './Pages/Categories';
import VendorsPage from './Pages/VendorsPage';
import AddVendor from './Pages/AddVendor';
import Drivers from './Pages/Drivers';
import AddDriver from './Pages/AddDriver';
import ShippingMethods from './Pages/ShippingMethods';
import Customers from './Pages/Customers';
import AddCustomer from './Pages/AddCustomer';
import Users from './Pages/Users';
import Media from './Pages/Media';
import Wallet from './Pages/Wallet';
import WalletSettings from './Pages/WalletSettings';
import WalletCharging from './Pages/WalletCharging';
import Notifications from './Pages/Notifications';
import Settings from './Pages/Settings';
import Advertisements from './Pages/Advertisements';
import PointsRewards from './Pages/PointsRewards';
import ReferralSystem from './Pages/ReferralSystem';
import Coupons from './Pages/Coupons';
import WholesaleCustomers from './Pages/WholesaleCustomers';
import Payments from './Pages/Payments';
import Ratings from './Pages/Ratings';
import RatingsReport from './Pages/RatingsReport';
import FinancialDashboard from './Pages/FinancialDashboard';
import ApiKeys from './Pages/ApiKeys';
import Orders from './Pages/Orders';
import Vendors from './Pages/Vendors';
import VendorCategoriesTable from './Pages/VendorCategoriesTable';
import { useSettings } from '../contexts/SettingsContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('overview');

  // Update document title when settings change
  useEffect(() => {
    document.title = `لوحة تحكم ${settings.store.name}`;
  }, [settings.store.name]);

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'admin-dashboard') {
      setActiveTab(path);
    } else {
      // Default to overview if we're at the root admin dashboard path
      setActiveTab('overview');
    }
  }, [location]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin-dashboard/${tab}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans overflow-x-hidden w-full">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 mr-64 max-w-[calc(100vw-16rem)]">
        <TopBar />
        <main className="p-6 space-y-6 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products-management" element={<ProductsManagement />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/vendors-list" element={<Vendors />} />
            <Route path="/add-vendor" element={<AddVendor />} />
            <Route path="/vendor-categories-table" element={<VendorCategoriesTable />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/add-driver" element={<AddDriver />} />
            <Route path="/shipping-methods" element={<ShippingMethods />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/add-customer" element={<AddCustomer />} />
            <Route path="/users" element={<Users />} />
            <Route path="/media" element={<Media />} />
            <Route path="/points-rewards" element={<PointsRewards />} />
            <Route path="/referral" element={<ReferralSystem />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/wallet-settings" element={<WalletSettings />} />
            <Route path="/wallet-charging" element={<WalletCharging />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/advertisements" element={<Advertisements />} />
            <Route path="/wholesale" element={<WholesaleCustomers />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/vendor-ratings" element={<Ratings type="vendor" />} />
            <Route path="/driver-ratings" element={<Ratings type="driver" />} />
            <Route path="/customer-ratings" element={<Ratings type="customer" />} />
            <Route path="/ratings-report" element={<RatingsReport />} />
            <Route path="/financial-dashboard" element={<FinancialDashboard />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="*" element={<Overview />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}