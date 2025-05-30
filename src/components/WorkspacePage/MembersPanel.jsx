import PropTypes from "prop-types";
import { decodeJwt } from "../../utils/tokenUtils";
import { useState } from "react";

export default function MembersPanel({ members, onInvite, onAssignRole, onRemoveMember, onRemovePermissions }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const token = localStorage.getItem("accessToken");
  const decodedToken = decodeJwt(token);
  const currentUserId = Number(decodedToken?.id);

  return (
    <div className="members-section">
      <div className="members-header">
        <h3>Members ({members?.length || 0})</h3>
        <button className="invite-user-button" onClick={onInvite}>
          Invite User
        </button>
      </div>
      <ul className="members-list">
        {members?.map((member) => {
          const isCurrentUser = member.id === currentUserId;
          return (
            <li key={member.id} className="member-item">
              <div className="member-info">
                {member.firstName} {member.lastName} ({member.email})
                {isCurrentUser && <span>(You)</span>}
              </div>
              {!isCurrentUser && (
                <div className="member-actions">
                  <button 
                    className="dropdown-toggle"
                    onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                  >
                    ⋮
                  </button>
                  {activeDropdown === member.id && (
                    <div className="dropdown-menu">
                      <button onClick={() => {
                        onAssignRole(member);
                        setActiveDropdown(null);
                      }}>
                        Assign Permissions
                      </button>
                      <button onClick={() => {
                        onRemovePermissions(member);
                        setActiveDropdown(null);
                      }}>
                        Remove Permissions
                      </button>
                      <button onClick={() => {
                        onRemoveMember(member.id);
                        setActiveDropdown(null);
                      }}>
                        Remove Member
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

MembersPanel.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  })),
  onInvite: PropTypes.func.isRequired,
  onAssignRole: PropTypes.func.isRequired,
  onRemoveMember: PropTypes.func.isRequired,
  onRemovePermissions: PropTypes.func.isRequired,
};
