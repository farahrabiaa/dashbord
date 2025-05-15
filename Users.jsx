import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';
import { supabase } from '../../lib/supabase';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer',
    password: '',
    confirm_password: ''
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users from the database
      const { data, error } = await supabase
        .from('custom_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('فشل في تحميل المستخدمين. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل المستخدمين');
      
      // Set empty array to avoid undefined errors
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const initialFilters = {
    username: {
      type: 'text',
      label: 'اسم المستخدم',
      placeholder: 'البحث باسم المستخدم',
      value: ''
    },
    name: {
      type: 'text',
      label: 'الاسم',
      placeholder: 'البحث بالاسم',
      value: ''
    },
    email: {
      type: 'text',
      label: 'البريد الإلكتروني',
      placeholder: 'البحث بالبريد الإلكتروني',
      value: ''
    },
    role: {
      type: 'select',
      label: 'الدور',
      placeholder: 'جميع الأدوار',
      options: [
        { value: 'admin', label: 'مدير' },
        { value: 'vendor', label: 'بائع' },
        { value: 'driver', label: 'سائق' },
        { value: 'customer', label: 'زبون' }
      ],
      value: ''
    },
    status: {
      type: 'select',
      label: 'الحالة',
      placeholder: 'جميع الحالات',
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' },
        { value: 'blocked', label: 'محظور' }
      ],
      value: ''
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      toast.error('كلمة المرور غير متطابقة');
      return;
    }

    try {
      setLoading(true);
      
      if (selectedUser) {
        // Update existing user
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          updated_at: new Date().toISOString()
        };
        
        // Add password only if changed
        if (formData.password) {
          // Use RPC function to hash password
          const { data: hashData, error: hashError } = await supabase.rpc(
            'hash_password',
            { password: formData.password }
          );
          
          if (hashError) throw hashError;
          
          updateData.password_hash = hashData;
        }
        
        const { error } = await supabase
          .from('custom_users')
          .update(updateData)
          .eq('id', selectedUser.id);
        
        if (error) throw error;
        
        toast.success('تم تحديث المستخدم بنجاح');
      } else {
        // Add new user
        const { data, error } = await supabase.rpc(
          'add_custom_user',
          {
            p_username: formData.username,
            p_password: formData.password,
            p_name: formData.name,
            p_email: formData.email,
            p_phone: formData.phone || '',
            p_role: formData.role
          }
        );
        
        if (error) throw error;
        
        toast.success('تم إضافة المستخدم بنجاح');
      }
      
      // Refresh users list
      fetchUsers();
      
      // Reset form and close modal
      setShowModal(false);
      setSelectedUser(null);
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'customer',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(selectedUser ? 'فشل في تحديث المستخدم' : 'فشل في إضافة المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error('لم يتم تحديد المستخدم');
      return;
    }

    if (passwordData.password !== passwordData.confirm_password) {
      toast.error('كلمة المرور غير متطابقة');
      return;
    }

    // Update password
    handleUpdatePassword(selectedUser.id, passwordData.password);
  };

  const handleUpdatePassword = async (userId, newPassword) => {
    try {
      setLoading(true);
      
      // Use RPC function to hash password
      const { data: hashData, error: hashError } = await supabase.rpc(
        'hash_password',
        { password: newPassword }
      );
      
      if (hashError) throw hashError;
      
      // Update password hash
      const { error } = await supabase
        .from('custom_users')
        .update({ 
          password_hash: hashData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success('تم تحديث كلمة المرور بنجاح');
      setShowPasswordModal(false);
      setSelectedUser(null);
      setPasswordData({
        password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('فشل في تحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('custom_users')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast.success('تم تحديث حالة المستخدم بنجاح');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('فشل في تحديث حالة المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('custom_users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      toast.success('تم حذف المستخدم بنجاح');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('فشل في حذف المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'vendor': return 'بائع';
      case 'driver': return 'سائق';
      case 'customer': return 'زبون';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'vendor': return 'bg-blue-100 text-blue-800';
      case 'driver': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'blocked': return 'محظور';
      default: return status;
    }
  };

  const filteredUsers = filterData(users);

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="text-lg font-semibold mb-2">خطأ</h3>
        <p>{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
        <button
          onClick={() => {
            setSelectedUser(null);
            setFormData({
              username: '',
              password: '',
              name: '',
              email: '',
              role: 'customer',
              confirm_password: ''
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إضافة مستخدم جديد
        </button>
      </div>

      <SearchFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المستخدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الهاتف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدور</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الإنشاء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    لا يوجد مستخدمين متطابقين مع معايير البحث
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}
                      >
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                        <option value="blocked">محظور</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setFormData({
                            username: user.username,
                            password: '', // لا نعرض كلمة المرور
                            name: user.name,
                            email: user.email || '',
                            phone: user.phone || '',
                            role: user.role,
                            status: user.status
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 ml-4"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setPasswordData({
                            password: '',
                            confirm_password: ''
                          });
                          setShowPasswordModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-800 ml-4"
                      >
                        كلمة المرور
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {selectedUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المستخدم <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedUser ? 'كلمة المرور الجديدة' : 'كلمة المرور'} {!selectedUser && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required={!selectedUser}
                  placeholder={selectedUser ? 'اتركه فارغًا للاحتفاظ بكلمة المرور الحالية' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور {!selectedUser && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required={!selectedUser || formData.password !== ''}
                  placeholder={selectedUser ? 'اتركه فارغًا للاحتفاظ بكلمة المرور الحالية' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدور <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="admin">مدير</option>
                  <option value="vendor">بائع</option>
                  <option value="driver">سائق</option>
                  <option value="customer">زبون</option>
                </select>
              </div>

              {selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="blocked">محظور</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'جاري الحفظ...' : (selectedUser ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Password Modal */}
      <Dialog
        open={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedUser(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              تغيير كلمة المرور
            </Dialog.Title>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  تحديث كلمة المرور
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}