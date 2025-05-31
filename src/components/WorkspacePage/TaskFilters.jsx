import PropTypes from 'prop-types';
import './TaskFilters.css';

export default function TaskFilters({ 
  statusFilter, 
  setStatusFilter, 
  sortBy, 
  setSortBy, 
  customStatuses = [],
  myTasksOnly, // new prop
  setMyTasksOnly, // new prop
  renderAfterStatusFilter // optional render prop
}) {
  return (
    <div className="task-filters">
      <div className="filter-group">
        {/* My Tasks checkbox first */}
        <label style={{ marginRight: 16, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, fontSize: 14 }}>
          <input
            type="checkbox"
            checked={myTasksOnly}
            onChange={e => setMyTasksOnly(e.target.checked)}
            style={{ accentColor: '#2563eb', width: 16, height: 16 }}
          />
          My Tasks only
        </label>
        <label>Status:</label>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All Tasks</option>
          <option value="TO_DO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
          {/* Removed My Tasks from dropdown */}
          {customStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        {/* {renderAfterStatusFilter && renderAfterStatusFilter()} */}
      </div>

      <div className="filter-group">
        <label>Sort by:</label>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="creationDateDesc">Created: Newest First</option>
          <option value="creationDateAsc">Created: Oldest First</option>
          <option value="deadlineDateAsc">Deadline: Earliest First</option>
          <option value="deadlineDateDesc">Deadline: Latest First</option>
          <option value="titleAsc">Title: A-Z</option>
          <option value="titleDesc">Title: Z-A</option>
          <option value="priorityDesc">Priority: High to Low</option>
          <option value="priorityAsc">Priority: Low to High</option>
        </select>
      </div>
    </div>
  );
}

TaskFilters.propTypes = {
  statusFilter: PropTypes.string.isRequired,
  setStatusFilter: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  setSortBy: PropTypes.func.isRequired,
  customStatuses: PropTypes.arrayOf(PropTypes.string),
  myTasksOnly: PropTypes.bool.isRequired, // new prop
  setMyTasksOnly: PropTypes.func.isRequired, // new prop
  renderAfterStatusFilter: PropTypes.func, // add prop validation
};
