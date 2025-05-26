import "./Workspace.css"
export default function Workspace({ id, name, number_of_members, creator }) {
    return (
      <div className="workspace">
        <h1 id="workspace-name">{name}</h1>
        <p className="members-count">Number of members: {number_of_members}</p>
        <a href={`/workspace/${id}`}>
          <button className="visit-button" >Visit Workspace</button>
        </a>
        <p>Creator: {creator}</p>
      </div>
    );
  }
  