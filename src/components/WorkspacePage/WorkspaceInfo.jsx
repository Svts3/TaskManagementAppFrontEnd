import PropTypes from 'prop-types';
import { getUserPermissions } from '../../utils/tokenUtils';

export default function WorkspaceInfo({ creator, creationDate, lastModifiedDate, workspaceId }) {
  const userPermissions = getUserPermissions(workspaceId);

  return (
    <div className="workspace-info">
      <h4>Workspace Info</h4>
      <div><b>Creator:</b> {creator?.firstName} {creator?.lastName}</div>
      <div><b>Created:</b> {new Date(creationDate).toLocaleString()}</div>
      <div><b>Last Modified:</b> {new Date(lastModifiedDate).toLocaleString()}</div>
      <div className="permissions-section" style={{ marginTop: '15px' }}>
        <b>Your Permissions:</b>
        {userPermissions.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: '8px 0', margin: 0 }}>
            {userPermissions.map((permission, index) => (
              <li key={index} style={{ 
                display: 'inline-block',
                margin: '4px',
                padding: '4px 8px',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                {permission}
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ color: '#6c757d', marginTop: '4px' }}>No permissions assigned</div>
        )}
      </div>
    </div>
  );
}

WorkspaceInfo.propTypes = {
  creator: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }),
  creationDate: PropTypes.string.isRequired,
  lastModifiedDate: PropTypes.string.isRequired,
  workspaceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
