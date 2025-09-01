import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { DateInterface } from "@/interfaces/Dates";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";

export const Home = () => {
  const { t } = useTranslation();
  const [dates, setDates] = useState<DateInterface[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDates = async (page: number = 0, size: number = 10) => {
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/dates?page=${page}&size=${size}`);
      setDates(response.data.dates);
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "errors.fetch_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDates();
  }, []);

  if (loading) return <div className="flex justify-center p-8">{t("common.loading")}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t("pages.home.welcome_message")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dates.map((date) => (
          <Card key={date.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              {date.icon_path && (
                <img
                  src={date.icon_path}
                  alt={date.title}
                  className="w-8 h-8 object-contain"
                />
              )}
              <div>
                <CardTitle className="text-lg">{date.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{date.category}</p>
              </div>
            </CardHeader>
            <CardContent>
              {date.notes && (
                <p className="text-sm text-muted-foreground mb-2">{date.notes}</p>
              )}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${date.done ? 'text-green-500' : 'text-yellow-500'}`}>
                  {date.done ? t('status.completed') : t('status.pending')}
                </span>
                {date.date_realised && (
                  <span className="text-sm text-muted-foreground">
                    {new Date(date.date_realised).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};