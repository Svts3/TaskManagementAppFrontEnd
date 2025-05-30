export const decodeJwt = (token) => {
  try {
    if (!token) {
      console.log("No token found in localStorage");
      return null;
    }
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Error decoding JWT:", e.message);
    return null;
  }
};

export const getUserPermissions = (workspaceId) => {
  const token = localStorage.getItem("accessToken");
  const decodedToken = decodeJwt(token);
  
  if (!decodedToken?.permissions) {
    return [];
  }

  // Get permissions for the specific workspace and remove duplicates
  const workspacePermissions = decodedToken.permissions[workspaceId] || [];
  return [...new Set(workspacePermissions)]; // Remove duplicates
};
