import { Link, useNavigate } from "react-router-dom";
import { ThemeChanger } from "./themeChanger";
import { LanguageChanger } from "./languageChanger";
import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import { Home, House, LogOut, Menu, User, Wrench, X, Heart, Camera } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAuthContext } from "@/contexts/authContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useLogout } from "@/hooks/useLogout";
import { AvatarWithStatusCell } from "@/components/customs/avatarStatusCell";
import { useConfigContext } from "../../contexts/configContext";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout, loading } = useLogout();
  const { authUser } = useAuthContext();
  const { getConfigValue } = useConfigContext();

  useEffect(() => {
    const fetchConfigValues = async () => {
      const values = await getConfigValue(["APP_NAME"]);
      setConfigValues(values);
    };
    fetchConfigValues();
  }, [getConfigValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const closeDialogAndNavigate = (link: string) => {
    setIsOpen(false);
    navigate(link);
  };

  const navLinks = [
    {
      label: t("navbar.home"),
      path: "/",
      icon: Home,
      auth: true,
    },
    {
      label: t("navbar.dates"),
      path: "/dates",
      icon: Heart,
      auth: true,
    },
    {
      label: t("navbar.souvenirs"),
      path: "/souvenirs",
      icon: Camera,
      auth: true,
    },
    {
      label: t("navbar.account"),
      path: "/account",
      icon: User,
      auth: true,
    },
    {
      label: t("navbar.dashboard"),
      path: "/admin/dashboard",
      icon: Wrench,
      auth: authUser?.role === "admin",
    },
  ];

  const mobileLinks = [
    {
      label: t("navbar.home"),
      path: "/",
      icon: House,
    },
    {
      label: t("navbar.dates"),
      path: "/dates",
      icon: Heart,
      auth: !!authUser,
    },
    {
      label: t("navbar.souvenirs"),
      path: "/souvenirs",
      icon: Camera,
      auth: !!authUser,
    },
    {
      label: t("navbar.account"),
      path: "/account",
      icon: User,
      auth: !!authUser,
    },
    {
      label: t("navbar.dashboard"),
      path: "/admin/dashboard",
      icon: Wrench,
      auth: authUser?.role === "admin",
    },
  ];

  return (
    <>
      {/* Floating Navbar Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
        {/* Desktop Navbar */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-lg border border-border/50 rounded-full shadow-lg">
          <div className="text-xl font-extrabold text-accent">
            <Link to="/">{configValues["APP_NAME"]}</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {authUser ? (
                <>
                  {navLinks
                    .filter((link) => link.auth)
                    .map((link) => (
                      <Button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        variant="ghost"
                        size="sm"
                        className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <link.icon className="w-4 h-4 mr-1.5" />
                        {link.label}
                      </Button>
                    ))}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="hover:cursor-pointer">
                      <span>
                        <AvatarWithStatusCell user={authUser} />
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40 rounded-xl">
                      <DropdownMenuLabel>
                        {authUser.name} {authUser.forename}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {navLinks
                          .filter((link) => link.auth)
                          .map((link) => (
                            <DropdownMenuItem
                              key={link.path}
                              className="flex items-center gap-2 hover:cursor-pointer rounded-lg"
                              onClick={() => navigate(link.path)}
                            >
                              {link.label}
                              <DropdownMenuShortcut>
                                <link.icon className="w-4 h-4" />
                              </DropdownMenuShortcut>
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem className="hover:cursor-pointer rounded-lg" onClick={() => logout()} disabled={loading}>
                          {t("navbar.logout")}
                          <DropdownMenuShortcut>
                            <LogOut className="w-4 h-4" />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={() => navigate("/login")} variant="ghost" size="sm" className="rounded-full">
                  {t("navbar.login")}
                </Button>
              )}
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <LanguageChanger />
              <ThemeChanger />
            </div>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="flex md:hidden items-center justify-between px-5 py-3 bg-background/80 backdrop-blur-lg border border-border/50 rounded-full shadow-lg">
          <div className="text-xl font-extrabold text-accent">
            <Link to="/">{configValues["APP_NAME"]}</Link>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Spacer to prevent content from hiding behind navbar */}
      <div className="h-20" />

      {/* Mobile Menu Slide-out */}
      <div
        ref={menuRef}
        className={cn(
          "fixed top-0 right-0 w-4/5 h-screen overflow-hidden bg-background/95 backdrop-blur-lg transition-transform duration-300 ease-in-out z-[60] border-l border-border/50",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" className="m-4 rounded-full" onClick={() => setIsOpen(!isOpen)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex flex-col gap-2 p-6 pt-2">
          {mobileLinks
            .filter((link) => link.auth === undefined || link.auth)
            .map((link) => (
              <Button
                key={link.path}
                onClick={() => closeDialogAndNavigate(link.path)}
                variant="ghost"
                className="flex items-center justify-start gap-4 rounded-xl py-6"
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Button>
            ))}
          {authUser && (
            <>
              <Separator className="my-2" />
              <Button onClick={() => logout()} variant="ghost" disabled={loading} className="flex items-center justify-start gap-4 rounded-xl py-6 text-destructive hover:text-destructive">
                <LogOut className="w-5 h-5" />
                {t("navbar.logout")}
              </Button>
            </>
          )}
          <Separator className="my-2" />
          <div className="flex items-center justify-center gap-4 pt-2">
            <LanguageChanger isMobile />
            <ThemeChanger />
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
