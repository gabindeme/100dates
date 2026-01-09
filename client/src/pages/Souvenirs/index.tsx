import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, useMemo } from "react";
import { DateInterface } from "@/interfaces/Dates";
import { CategoryInterface } from "@/interfaces/Category";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Heart, Calendar, Quote, X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Souvenirs = () => {
    const { t, i18n } = useTranslation();
    const [completedDates, setCompletedDates] = useState<DateInterface[]>([]);
    const [categories, setCategories] = useState<CategoryInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Filter state
    const [selectedYear, setSelectedYear] = useState<string>("all");
    const [selectedMonth, setSelectedMonth] = useState<string>("all");

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

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

    // Get available years from completed dates
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        completedDates.forEach(date => {
            if (date.date_realised) {
                years.add(new Date(date.date_realised).getFullYear());
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [completedDates]);

    // Get available months for selected year
    const availableMonths = useMemo(() => {
        if (selectedYear === "all") return [];
        const months = new Set<number>();
        completedDates.forEach(date => {
            if (date.date_realised) {
                const d = new Date(date.date_realised);
                if (d.getFullYear().toString() === selectedYear) {
                    months.add(d.getMonth());
                }
            }
        });
        return Array.from(months).sort((a, b) => a - b);
    }, [completedDates, selectedYear]);

    // Filter dates based on selection
    const filteredDates = useMemo(() => {
        return completedDates.filter(date => {
            if (!date.date_realised) return false;
            const d = new Date(date.date_realised);

            if (selectedYear !== "all" && d.getFullYear().toString() !== selectedYear) {
                return false;
            }
            if (selectedMonth !== "all" && d.getMonth().toString() !== selectedMonth) {
                return false;
            }
            return true;
        });
    }, [completedDates, selectedYear, selectedMonth]);

    // Reset month when year changes
    useEffect(() => {
        setSelectedMonth("all");
    }, [selectedYear]);

    // Get month name in current locale
    const getMonthName = (monthIndex: number) => {
        const date = new Date(2000, monthIndex, 1);
        return date.toLocaleDateString(i18n.language, { month: 'long' });
    };

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
        return date.toLocaleDateString(i18n.language, {
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

    const openLightbox = (images: string[], startIndex: number) => {
        setLightboxImages(images);
        setLightboxIndex(startIndex);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    const nextImage = () => {
        setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
    };

    const prevImage = () => {
        setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, lightboxImages.length]);

    if (loading) {
        return <div className="flex justify-center p-8">{t("common.loading")}</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                    {t("pages.souvenirs.title")}
                </h1>
                <p className="text-muted-foreground">{t("pages.souvenirs.subtitle")}</p>
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                    <span>{completedDates.length} {t("pages.souvenirs.memories")}</span>
                </div>
            </div>

            {/* Filters */}
            {completedDates.length > 0 && availableYears.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 mb-8 p-4 bg-card rounded-xl border">
                    <Filter className="h-4 w-4 text-muted-foreground" />

                    {/* Year filter */}
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder={t("pages.souvenirs.filters.year")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("pages.souvenirs.filters.all_time")}</SelectItem>
                            {availableYears.map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Month filter - only show if a year is selected */}
                    {selectedYear !== "all" && availableMonths.length > 0 && (
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder={t("pages.souvenirs.filters.month")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("pages.souvenirs.filters.all_months")}</SelectItem>
                                {availableMonths.map(month => (
                                    <SelectItem key={month} value={month.toString()}>
                                        {getMonthName(month)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Results count */}
                    {(selectedYear !== "all" || selectedMonth !== "all") && (
                        <span className="text-sm text-muted-foreground ml-2">
                            {t("pages.souvenirs.filters.showing")} {filteredDates.length} {t("pages.souvenirs.filters.of")} {completedDates.length}
                        </span>
                    )}
                </div>
            )}

            {filteredDates.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Heart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">{t("pages.souvenirs.empty")}</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 via-purple-500 to-indigo-500" />

                    {filteredDates.map((date, index) => {
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

                                        {/* Images gallery */}
                                        {date.images && date.images.length > 0 && (
                                            <div className={`grid gap-2 mt-3 ${date.images.length === 1 ? 'grid-cols-1' :
                                                date.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                                                }`}>
                                                {date.images.map((img, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => openLightbox(date.images, idx)}
                                                    >
                                                        <img
                                                            src={img}
                                                            alt=""
                                                            loading="lazy"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
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

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-all hover:scale-110 z-10"
                    >
                        <X className="h-7 w-7" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-6 left-6 text-white/60 text-sm font-medium">
                        {lightboxIndex + 1} / {lightboxImages.length}
                    </div>

                    {/* Previous button */}
                    {lightboxImages.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 md:left-8 p-3 text-white/60 hover:text-white transition-all hover:scale-110 bg-white/10 hover:bg-white/20 rounded-full"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                    )}

                    {/* Image container with animation */}
                    <div
                        key={lightboxIndex}
                        className="animate-in fade-in zoom-in-95 duration-300"
                    >
                        <img
                            src={lightboxImages[lightboxIndex]}
                            alt=""
                            className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Next button */}
                    {lightboxImages.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 md:right-8 p-3 text-white/60 hover:text-white transition-all hover:scale-110 bg-white/10 hover:bg-white/20 rounded-full"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
