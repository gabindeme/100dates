import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 w-full text-center border-t bg-background text-primary">
      <h1>{t("footer.made_with")} ❤️ {t("footer.by")} Gabin - © 2025</h1>
    </div>
  );
};

