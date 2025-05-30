export default function AssignRoleModal({ isOpen, onClose, onSubmit, roleForm, setRoleForm, selectedMember, setSelectedMember }) {
  if (!isOpen) return null;

  const handlePermissionChange = (permission) => {
    const currentPermissions = roleForm.permissions || [];
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    setRoleForm({ ...roleForm, permissions: newPermissions });
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Assign Permissions to {selectedMember?.firstName} {selectedMember?.lastName}</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Permissions</label>
            <div className="permissions-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['READ', 'CREATE', 'WRITE', 'DELETE', 'ADMINISTRATION'].map(permission => (
                <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={roleForm.permissions?.includes(permission) || false}
                    onChange={() => handlePermissionChange(permission)}
                  />
                  {permission}
                </label>
              ))}
            </div>
            {roleForm.error && (
              <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
                {roleForm.error}
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button type="submit" disabled={!roleForm.permissions?.length}>
              Assign Permissions
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                setSelectedMember(null);
                setRoleForm({ permissions: [] });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
