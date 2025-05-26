import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function UserDetailsPage() {
  const { id } = useParams(); // user ID from URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('No access token found. Please sign in.');
        }

        console.log('Fetching user with ID:', id);
        const response = await axios.get(`http://localhost:8080/users/${id}`, {
          headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        });
        setUser(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error.message || 'Failed to fetch user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center mt-10 text-red-500">User not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">User Details</h2>
      <div className="space-y-4">
        <div>
          <strong>First Name:</strong> {user.firstName}
        </div>
        <div>
          <strong>Last Name:</strong> {user.lastName}
        </div>
        <div>
          <strong>Email PopperEmail:</strong> {user.email}
        </div>
        <div>
          <strong>Roles:</strong>{' '}
          {user.roles && user.roles.length > 0
            ? user.roles.map(role => role.name).join(', ')
            : 'No roles assigned'}
        </div>
        <div>
          <strong>Created At:</strong>{' '}
          {new Date(user.creationDate).toLocaleString()}
        </div>
        <div>
          <strong>Last Modified:</strong>{' '}
          {new Date(user.lastModifiedDate).toLocaleString()}
        </div>
      </div>
    </div>
  );
}