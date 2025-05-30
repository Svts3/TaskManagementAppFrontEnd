import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './UserProfilePage.css';

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editField, setEditField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    if (!accessToken) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    } else {
      setIsAuthenticated(true);
    }
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/users/${id}`,
          { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials: true });
        setUser(response.data);
        setError(null);
      } catch (error) {
        setError(error.message || 'Failed to fetch user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, accessToken]);

  // Open edit modal for a specific field
  const openFieldEdit = (field) => {
    setEditField(field);
    setEditError(null);
    setEditSuccess(null);
    if (field === "firstName") setFieldValue(user.firstName || "");
    if (field === "lastName") setFieldValue(user.lastName || "");
    if (field === "password") setFieldValue("");
    setIsEditModalOpen(true);
  };

  // Handle edit for first name or last name
  const handleFieldEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      const updateData = {};
      if (editField === "firstName") updateData.firstName = fieldValue;
      if (editField === "lastName") updateData.lastName = fieldValue;
      const response = await axios.patch(
        `http://localhost:8080/users/${id}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      setUser(response.data);
      setEditSuccess('Profile updated successfully!');
      setTimeout(() => setIsEditModalOpen(false), 1200);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle password change request (direct PATCH to /users/{id}/password)
  const handlePasswordChangeRequest = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      // Expecting currentPassword and newPassword fields
      const [currentPassword, newPassword] = fieldValue.split(':::');
      if (!currentPassword || !newPassword) {
        setEditError('Please enter both your current and new password.');
        setEditLoading(false);
        return;
      }
      await axios.patch(
        `http://localhost:8080/users/${id}/password`,
        { currentPassword, newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setEditSuccess('Password changed successfully!');
      setTimeout(() => setIsEditModalOpen(false), 2000);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setEditLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-error">
        <div className="error-container">
          <h2>Authentication Required</h2>
          <p>Please log in to view this profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-container">
          <h2>Error Loading Profile</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {user && (
        <>
          <div className="profile-header">
            <div className="profile-header-content">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=4f46e5&color=fff&size=200`} 
                alt={`${user.firstName} ${user.lastName}`}
                className="profile-avatar"
              />
              <div className="profile-title">
                <h1>{user.firstName} {user.lastName}</h1>
                <p className="profile-email">{user.email}</p>
                <p className="member-since">Member since {new Date(user.creationDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-section">
              <h2>Profile Information</h2>
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-header">
                    <h3>First Name</h3>
                    <button onClick={() => openFieldEdit('firstName')} className="edit-button">
                      Edit
                    </button>
                  </div>
                  <p>{user.firstName}</p>
                </div>

                <div className="info-card">
                  <div className="info-header">
                    <h3>Last Name</h3>
                    <button onClick={() => openFieldEdit('lastName')} className="edit-button">
                      Edit
                    </button>
                  </div>
                  <p>{user.lastName}</p>
                </div>

                <div className="info-card">
                  <div className="info-header">
                    <h3>Email</h3>
                  </div>
                  <p>{user.email}</p>
                </div>

                <div className="info-card">
                  <div className="info-header">
                    <h3>Password</h3>
                    <button onClick={() => openFieldEdit('password')} className="edit-button">
                      Change
                    </button>
                  </div>
                  <p>••••••••</p>
                </div>

                <div className="info-card full-width">
                  <div className="info-header">
                    <h3>Account Details</h3>
                  </div>
                  <div className="account-details">
                    <div>
                      <span>Created:</span>
                      <span>{new Date(user.creationDate).toLocaleString()}</span>
                    </div>
                    <div>
                      <span>Last Modified:</span>
                      <span>{new Date(user.lastModifiedDate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {isEditModalOpen && (
        <div className="modal" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editField === 'password' 
                  ? 'Change Password' 
                  : `Edit ${editField === 'firstName' ? 'First Name' : 'Last Name'}`}
              </h2>
              <button className="close-button" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>

            <form onSubmit={editField === 'password' ? handlePasswordChangeRequest : handleFieldEditSubmit}>
              <div className="form-group">
                {editField === 'password' ? (
                  <>
                    <div className="input-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={fieldValue.split(':::')[0] || ''}
                        onChange={e => setFieldValue(e.target.value + ':::' + (fieldValue.split(':::')[1] || ''))}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div className="input-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={fieldValue.split(':::')[1] || ''}
                        onChange={e => setFieldValue((fieldValue.split(':::')[0] || '') + ':::' + e.target.value)}
                        required
                        autoComplete="new-password"
                        placeholder="Enter your new password"
                      />
                    </div>
                  </>
                ) : (
                  <div className="input-group">
                    <label>{editField === 'firstName' ? 'First Name' : 'Last Name'}</label>
                    <input
                      type="text"
                      value={fieldValue}
                      onChange={e => setFieldValue(e.target.value)}
                      required
                      placeholder={`Enter your ${editField === 'firstName' ? 'first' : 'last'} name`}
                    />
                  </div>
                )}
              </div>

              {editError && <div className="error-message">{editError}</div>}
              {editSuccess && <div className="success-message">{editSuccess}</div>}

              <div className="modal-actions">
                <button type="submit" className="primary-button" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="secondary-button" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}