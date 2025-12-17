import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { DateInterface } from "@/interfaces/Dates";
import { CategoryInterface } from "@/interfaces/Category";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Heart, Calendar, Quote } from "lucide-react";

export const Souvenirs = () => {
    const { t } = useTranslation();
    const [completedDates, setCompletedDates] = useState<DateInterface[]>([]);
    const [categories, setCategories] = useState<CategoryInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [datesRes, categoriesRes] = await Promise.all([
                    axiosConfig.get("/dates?page=0&size=500"),
                    axiosConfig.get("/categories")
                ]);

                const completed = datesRes.data.dates
                    .filter((d: DateInterface) => d.done && d.date_realised)
                    .sort((a: DateInterface, b: DateInterface) =>
                        new Date(b.date_realised!).getTime() - new Date(a.date_realised!).getTime()
                    );

                setCompletedDates(completed);
                setCategories(categoriesRes.data);
            } catch (error: any) {
                toast.error(t(error.response?.data?.error || "errors.fetch_failed"));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [t]);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleItems((prev) => {
                            const newSet = new Set(Array.from(prev));
                            newSet.add(entry.target.id);
                            return newSet;
                        });
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        return () => observerRef.current?.disconnect();
    }, []);

    const getCategoryColor = (categoryName: string) => {
        const category = categories.find(c => c.name === categoryName);
        return category?.color || "#6366f1";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t("souvenirs.today");
        if (diffDays === 1) return t("souvenirs.yesterday");
        if (diffDays < 7) return t("souvenirs.days_ago", { count: diffDays });
        if (diffDays < 30) return t("souvenirs.weeks_ago", { count: Math.floor(diffDays / 7) });
        if (diffDays < 365) return t("souvenirs.months_ago", { count: Math.floor(diffDays / 30) });
        return t("souvenirs.years_ago", { count: Math.floor(diffDays / 365) });
    };

    if (loading) {
        return <div className="flex justify-center p-8">{t("common.loading")}</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                    {t("pages.souvenirs.title")}
                </h1>
                <p className="text-muted-foreground">{t("pages.souvenirs.subtitle")}</p>
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                    <span>{completedDates.length} {t("pages.souvenirs.memories")}</span>
                </div>
            </div>

            {completedDates.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Heart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">{t("pages.souvenirs.empty")}</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 via-purple-500 to-indigo-500" />

                    {completedDates.map((date, index) => {
                        const isLeft = index % 2 === 0;
                        const itemId = `item-${date._id}`;
                        const isVisible = visibleItems.has(itemId);

                        return (
                            <div
                                key={date._id}
                                id={itemId}
                                ref={(el) => {
                                    if (el) observerRef.current?.observe(el);
                                }}
                                className={`relative flex items-center mb-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                                    }`}
                            >
                                {/* Timeline dot */}
                                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10">
                                    <div
                                        className={`w-4 h-4 rounded-full border-4 border-background transition-all duration-500 ${isVisible ? 'scale-100' : 'scale-0'
                                            }`}
                                        style={{ backgroundColor: getCategoryColor(date.category) }}
                                    />
                                </div>

                                {/* Content card */}
                                <div
                                    className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] transition-all duration-700 ease-out ${isVisible
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-8'
                                        } ${isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}
                                    style={{ transitionDelay: `${index * 50}ms` }}
                                >
                                    <div
                                        className="p-5 rounded-xl border bg-card shadow-lg hover:shadow-xl transition-shadow"
                                        style={{ borderTopColor: getCategoryColor(date.category), borderTopWidth: 3 }}
                                    >
                                        {/* Date header */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDate(date.date_realised!)}</span>
                                            <span className="ml-auto px-2 py-0.5 rounded-full bg-muted">
                                                {getRelativeTime(date.date_realised!)}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-semibold mb-2">{date.title}</h3>

                                        {/* Category badge */}
                                        <span
                                            className="inline-block px-3 py-1 text-xs rounded-full mb-3"
                                            style={{
                                                backgroundColor: `${getCategoryColor(date.category)}20`,
                                                color: getCategoryColor(date.category)
                                            }}
                                        >
                                            {date.category}
                                        </span>

                                        {/* Notes */}
                                        {date.notes && (
                                            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg mt-2">
                                                <Quote className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <p className="text-sm italic text-muted-foreground">{date.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* End heart */}
                    <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 -bottom-8">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-white fill-white" />
                        </div>
                    </div>
                </div>
            )}

            <div className="h-16" /> {/* Bottom spacing */}
        </div>
    );
};
