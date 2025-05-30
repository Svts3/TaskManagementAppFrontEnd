export default function InviteUserModal({ isOpen, onClose, onSubmit, inviteForm, setInviteForm, inviteError }) {
  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Invite Users</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email Addresses (separate multiple emails with commas)</label>
            <textarea
              value={inviteForm.emails?.join(', ') || ''}
              onChange={(e) => {
                const emails = e.target.value.split(',').map(email => email.trim()).filter(email => email !== '');
                setInviteForm({ emails });
              }}
              placeholder="user1@example.com, user2@example.com"
              required
              rows={4}
              style={{ width: '100%', resize: 'vertical' }}
            />
            {inviteError && <div className="error-message" style={{ color: 'red', marginTop: '5px' }}>{inviteError}</div>}
          </div>
          <div className="modal-actions">
            <button type="submit">Send Invites</button>
            <button
              type="button"
              onClick={() => {
                onClose();
                setInviteForm({ emails: [] });
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
