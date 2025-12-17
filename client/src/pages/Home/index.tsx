import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from "react";
import { DateInterface } from "@/interfaces/Dates";
import { CategoryInterface } from "@/interfaces/Category";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Heart,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Dices
} from "lucide-react";

export const Home = () => {
  const { t } = useTranslation();
  const [allDates, setAllDates] = useState<DateInterface[]>([]);
  const [categories, setCategories] = useState<CategoryInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [shuffleKey, setShuffleKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [datesRes, categoriesRes] = await Promise.all([
          axiosConfig.get("/dates?page=0&size=100"),
          axiosConfig.get("/categories")
        ]);
        setAllDates(datesRes.data.dates);
        setCategories(categoriesRes.data);
      } catch (error: any) {
        toast.error(t(error.response?.data?.error || "errors.fetch_failed"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  // Statistics
  const stats = useMemo(() => {
    const completed = allDates.filter(d => d.done);
    const pending = allDates.filter(d => !d.done);
    return {
      total: allDates.length,
      completed: completed.length,
      pending: pending.length,
      percentage: allDates.length > 0 ? Math.round((completed.length / allDates.length) * 100) : 0
    };
  }, [allDates]);

  // Last completed date
  const lastCompleted = useMemo(() => {
    const completed = allDates.filter(d => d.done && d.date_realised);
    if (completed.length === 0) return null;
    return completed.sort((a, b) =>
      new Date(b.date_realised!).getTime() - new Date(a.date_realised!).getTime()
    )[0];
  }, [allDates]);

  // Random pending dates (3 random)
  const randomPending = useMemo(() => {
    const pending = allDates.filter(d => !d.done);
    if (pending.length === 0) return [];
    const shuffled = [...pending].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDates, shuffleKey]);

  const handleReshuffle = () => {
    setShuffleKey(prev => prev + 1);
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || "#6366f1";
  };

  if (loading) {
    return <div className="flex justify-center p-8">{t("common.loading")}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {t("pages.home.dashboard_title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("pages.home.dashboard_subtitle")}</p>
        </div>
        <Link to="/dates">
          <Button className="gap-2">
            {t("pages.home.view_all")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.stats.total")}
            </CardTitle>
            <Heart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.stats.completed")}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.stats.pending")}
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.stats.progress")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.percentage}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last Completed Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {t("dashboard.last_completed.title")}
            </CardTitle>
            <CardDescription>{t("dashboard.last_completed.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {lastCompleted ? (
              <div
                className="p-4 rounded-lg border-l-4"
                style={{
                  borderLeftColor: getCategoryColor(lastCompleted.category),
                  backgroundColor: `${getCategoryColor(lastCompleted.category)}10`
                }}
              >
                <h3 className="font-semibold text-lg">{lastCompleted.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{lastCompleted.notes}</p>
                <div className="flex items-center justify-between mt-3">
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${getCategoryColor(lastCompleted.category)}20`,
                      color: getCategoryColor(lastCompleted.category)
                    }}
                  >
                    {lastCompleted.category}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {new Date(lastCompleted.date_realised!).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>{t("dashboard.last_completed.empty")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Random Suggestions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t("dashboard.suggestions.title")}
              </CardTitle>
              <CardDescription>{t("dashboard.suggestions.description")}</CardDescription>
            </div>
            {randomPending.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleReshuffle}
                className="h-8 w-8 hover:bg-primary/10"
                title={t("dashboard.suggestions.reshuffle")}
              >
                <Dices className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {randomPending.length > 0 ? (
              <div className="space-y-3">
                {randomPending.map((date) => (
                  <div
                    key={date._id}
                    className="p-3 rounded-lg border hover:shadow-md transition-shadow"
                    style={{ borderLeftWidth: 3, borderLeftColor: getCategoryColor(date.category) }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{date.title}</h4>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                          style={{
                            backgroundColor: `${getCategoryColor(date.category)}20`,
                            color: getCategoryColor(date.category)
                          }}
                        >
                          {date.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>{t("dashboard.suggestions.empty")}</p>
                <Link to="/dates">
                  <Button variant="link" className="mt-2">
                    {t("dates.empty.action")}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};