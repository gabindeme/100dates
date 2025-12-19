import { useTranslation } from "react-i18next";
import { FR, GB } from "country-flag-icons/react/3x2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Globe } from "lucide-react";
import { getFullNamesOfLocales, listOfLocales } from "@/lib/i18n";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface LanguageChangerProps {
  isMobile?: boolean;
}

export const LanguageChanger = ({ isMobile = false }: LanguageChangerProps) => {
  const {
    i18n: { changeLanguage, language, t },
  } = useTranslation();

  const handleChangeLanguage = (l: string) => {
    localStorage.setItem("i18nextLng", l);
    changeLanguage(l);
    toast.success(t("navbar.languageChanged"));
  };

  // Mobile version: simple buttons with flags only
  if (isMobile) {
    return (
      <div className="flex gap-2">
        {listOfLocales.map((l) => (
          <Button
            key={l}
            variant={language === l ? "default" : "outline"}
            size="icon"
            onClick={() => handleChangeLanguage(l)}
            className="min-h-[44px] min-w-[44px]"
          >
            {l === "fr" && <FR className="w-6 h-4" />}
            {l === "en" && <GB className="w-6 h-4" />}
          </Button>
        ))}
      </div>
    );
  }

  // Desktop version: dropdown
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="cursor-pointer text-primary">
        <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="center" sideOffset={8}>
        <DropdownMenuLabel>{t("navbar.language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {listOfLocales.map((l) => (
          <DropdownMenuItem
            key={l}
            onSelect={() => handleChangeLanguage(l)}
            className={`cursor-pointer flex items-center gap-2 min-h-[44px] ${language === l ? "bg-secondary" : ""}`}
          >
            {l === "fr" && <FR className="w-6 h-4" />}
            {l === "en" && <GB className="w-6 h-4" />}
            {getFullNamesOfLocales(l)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
