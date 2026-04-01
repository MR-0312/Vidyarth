import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface SidebarItem {
  id: string;
  label: string;
  icon: JSX.Element;
}

interface SidebarProps {
  isOpen: boolean;
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

const Sidebar = ({ isOpen, items, activeItem, onItemClick }: SidebarProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarStyles: React.CSSProperties = {
    width: isOpen ? "240px" : "0",
    transition: "width 0.3s ease",
    backgroundColor: "#0db8a6",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  };

  const logoContainerStyles: React.CSSProperties = {
    padding: "25px 20px",
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  const logoStyles: React.CSSProperties = {
    margin: 0,
    fontSize: "28px",
    fontWeight: "300",
    color: "white",
    letterSpacing: "0.5px",
  };

  const navStyles: React.CSSProperties = {
    paddingTop: "12px",
  };

  const navListStyles: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
    margin: 0,
  };

  const navItemStyles = (isActive: boolean): React.CSSProperties => ({
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    backgroundColor: isActive ? "#005dc6" : "transparent",
    borderRadius: "0 5px 5px 0",
    cursor: "pointer",
    marginBottom: "4px",
    color: "white",
    transition: "background-color 0.2s ease",
  });

  const userSectionStyles: React.CSSProperties = {
    padding: "20px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    marginTop: "auto",
  };

  const userInfoStyles: React.CSSProperties = {
    marginBottom: "15px",
    fontSize: "14px",
    color: "rgba(255,255,255,0.8)",
  };

  const logoutButtonStyles: React.CSSProperties = {
    width: "100%",
    padding: "10px 0",
    backgroundColor: "rgba(255,255,255,0.2)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "5px",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  return (
    <div style={sidebarStyles}>
      {/* Logo */}
      <div style={logoContainerStyles}>
        <h1 style={logoStyles}>koodo</h1>
      </div>

      {/* Navigation Items */}
      <nav style={navStyles}>
        <ul style={navListStyles}>
          {items.map((item) => (
            <li
              key={item.id}
              style={navItemStyles(activeItem === item.id)}
              onClick={() => onItemClick?.(item.id)}
              onMouseEnter={(e) => {
                if (activeItem !== item.id) {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeItem !== item.id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span style={{ marginRight: "15px", display: "flex" }}>
                {item.icon}
              </span>
              <span style={{ fontSize: "16px" }}>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section with Logout */}
      <div style={userSectionStyles}>
        {user && (
          <div style={userInfoStyles}>
            <div style={{ fontWeight: "500", marginBottom: "5px" }}>
              {user.name}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>{user.email}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
          }}
          style={logoutButtonStyles}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
