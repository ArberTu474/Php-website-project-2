import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "store/authStore"
import Button from "components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "components/ui/avatar"
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Presentation,
} from "lucide-react"

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const initials = user
    ? `${user.firstname[0] ?? ""}${user.lastname[0] ?? ""}`.toUpperCase()
    : "?"

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          Learnify
        </Link>

        <nav className="navbar-nav">
          <Button variant="ghost" size="lg" asChild>
            <Link to="/" className="navbar-link-btn">
              Courses
            </Link>
          </Button>

          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="lg" asChild>
                <Link to="/dashboard" className="navbar-link-btn">
                  Dashboard
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="navbar-avatar-trigger"
                    aria-label="User menu"
                    type="button"
                  >
                    <Avatar size="lg">
                      <AvatarFallback className="font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-52">
                  <div className="navbar-user-summary">
                    <p className="navbar-user-name">
                      {user?.firstname} {user?.lastname}
                    </p>

                    <div className="navbar-user-role">
                      {user?.role === "teacher" ? (
                        <>
                          <Presentation size={16} />
                          <p>Teacher</p>
                        </>
                      ) : (
                        <>
                          <GraduationCap size={16} />
                          <p>Student</p>
                        </>
                      )}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="navbar-menu-link" asChild>
                    <Link to="/dashboard">
                      <div className="navbar-menu-link-row">
                        <LayoutDashboard size={16} />
                        <p>Dashboard</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    variant="destructive"
                    className="navbar-menu-link"
                    onClick={handleLogout}
                  >
                    <div className="navbar-menu-link-row">
                      <LogOut size={16} />
                      <p>Log out</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="lg" asChild>
                <Link to="/login">Log in</Link>
              </Button>

              <Button size="lg" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}