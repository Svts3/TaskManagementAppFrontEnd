export default function Sidebar({ creator, creationDate, lastModifiedDate, members, onInvite, onAssignRole, onRemoveMember }) {
  return (
    <div className="sidebar">
      <div className="workspace-info">
        <h3>Workspace Info</h3>
        <p>
          <strong>Created by:</strong> {creator?.firstName} {creator?.lastName}
        </p>
        <p>
          <strong>Creation Date:</strong> {new Date(creationDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Last Modified:</strong> {new Date(lastModifiedDate).toLocaleDateString()}
        </p>
      </div>
      <div className="members-section">
        <div className="members-header">
          <h3>Members ({members?.length || 0})</h3>
          <button className="invite-user-button" onClick={onInvite}>
            Invite User
          </button>
        </div>
        <ul className="members-list">
          {members?.map((member) => (
            <li key={member.id} className="member-item">
              {member.firstName} {member.lastName} ({member.email})
              <div className="member-actions">
                <button className="assign-role-button" onClick={() => onAssignRole(member)}>
                  Assign Role
                </button>
                <button className="remove-member-button" onClick={() => onRemoveMember(member.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
// No changes needed, authentication is handled in WorkspacePage
