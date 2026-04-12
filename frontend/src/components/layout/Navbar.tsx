import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GraduationCap, Presentation } from "lucide-react"

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : ""

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto my-0 flex max-w-7xl items-center justify-between px-10 py-3">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-primary">
          Learnify
        </Link>

        {/* Nav links */}
        <nav className="flex items-center justify-between gap-2">
          <Button variant={"ghost"} size={"lg"} asChild>
            <Link to="/" className="text-lg no-underline">
              Courses
            </Link>
          </Button>

          {isAuthenticated ? (
            <>
              <Button variant={"ghost"} size={"lg"} asChild>
                <Link to="/dashboard" className="text-lg no-underline">
                  Dashboard
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="cursor-pointer rounded-full border-0 bg-transparent"
                    aria-label="User menu"
                  >
                    <Avatar size="lg">
                      <AvatarFallback className="font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-52">
                  <div className="p-2">
                    <p className="mb-3 text-lg font-bold">
                      {user?.first_name} {user?.last_name}
                    </p>

                    {user?.role === "teacher" ? (
                      <div className="flex items-center gap-1">
                        <Presentation size="20" />
                        <p className="text-sm">Teacher</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <GraduationCap size="20" />
                        <p className="text-sm">Student</p>
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <p>Log out</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant={"ghost"} size={"lg"} asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size={"lg"} asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
