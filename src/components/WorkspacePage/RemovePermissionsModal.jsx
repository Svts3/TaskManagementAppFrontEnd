import PropTypes from "prop-types";
import { useState } from "react";
import { getUserPermissions } from "../../utils/tokenUtils";

export default function RemovePermissionsModal({ isOpen, onClose, onSubmit, member, workspaceId }) {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const currentPermissions = getUserPermissions(workspaceId);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ memberId: member.id, permissions: selectedPermissions });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Remove Permissions</h2>
        <p>Select permissions to remove from {member.firstName} {member.lastName}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Permissions:</label>
            <div className="permissions-list">
              {currentPermissions.map(permission => (
                <label key={permission} className="permission-checkbox">
                  <input
                    type="checkbox"
                    value={permission}
                    checked={selectedPermissions.includes(permission)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions([...selectedPermissions, permission]);
                      } else {
                        setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
                      }
                    }}
                  />
                  {permission.toLowerCase().replace('_', ' ')}
                </label>
              ))}
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button 
              type="submit" 
              disabled={selectedPermissions.length === 0}
            >
              Remove Selected Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

RemovePermissionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  member: PropTypes.object,
  workspaceId: PropTypes.string.isRequired
};
