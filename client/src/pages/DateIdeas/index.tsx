import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback, useMemo } from "react";
import { DateInterface } from "@/interfaces/Dates";
import { CategoryInterface } from "@/interfaces/Category";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { DateCard } from "@/components/customs/DateCard";
import { FilterBar } from "@/components/customs/FilterBar";
import { DateForm } from "@/components/customs/DateForm";
import { CompletionDialog } from "@/components/customs/CompletionDialog";
import { CategoryManager } from "@/components/customs/CategoryManager";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

export const DateIdeas = () => {
    const { t } = useTranslation();
    const [allDates, setAllDates] = useState<DateInterface[]>([]);
    const [categories, setCategories] = useState<CategoryInterface[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [sortBy, setSortBy] = useState("title"); // Default to alphabetical
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchQuery, setSearchQuery] = useState("");
    const [pageSize, setPageSize] = useState("25");

    // Dialogs
    const [formOpen, setFormOpen] = useState(false);
    const [completionOpen, setCompletionOpen] = useState(false);
    const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<DateInterface | null>(null);

    const fetchCategories = async () => {
        try {
            const response = await axiosConfig.get("/categories");
            setCategories(response.data);
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "errors.fetch_failed"));
        }
    };

    const fetchDates = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosConfig.get("/dates?page=0&size=500");
            setAllDates(response.data.dates);
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "errors.fetch_failed"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    // Client-side filtering, sorting, and pagination
    const filteredDates = useMemo(() => {
        let result = [...allDates];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.title.toLowerCase().includes(query) ||
                d.notes?.toLowerCase().includes(query) ||
                d.category.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategory !== "all") {
            result = result.filter(d => d.category === selectedCategory);
        }

        // Status filter
        if (selectedStatus !== "all") {
            result = result.filter(d => d.done === (selectedStatus === "true"));
        }

        // Sorting
        result.sort((a, b) => {
            let comparison = 0;
            if (sortBy === "title") {
                comparison = a.title.localeCompare(b.title);
            } else if (sortBy === "createdAt") {
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortBy === "date_realised") {
                const dateA = a.date_realised ? new Date(a.date_realised).getTime() : 0;
                const dateB = b.date_realised ? new Date(b.date_realised).getTime() : 0;
                comparison = dateA - dateB;
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });

        // Pagination
        if (pageSize !== "all") {
            const limit = parseInt(pageSize);
            result = result.slice(0, limit);
        }

        return result;
    }, [allDates, searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder, pageSize]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchDates();
    }, [fetchDates]);

    const getCategoryColor = (categoryName: string) => {
        const category = categories.find(c => c.name === categoryName);
        return category?.color;
    };

    const handleToggle = (date: DateInterface) => {
        if (!date.done) {
            setSelectedDate(date);
            setCompletionOpen(true);
        } else {
            handleUndoComplete(date);
        }
    };

    const handleComplete = async (date: DateInterface, realisationDate: string) => {
        try {
            await axiosConfig.patch(`/dates/${date._id}/toggle`, {
                done: true,
                date_realised: realisationDate,
            });
            toast.success(t("dates.messages.marked_complete"));
            fetchDates();
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "errors.update_failed"));
        }
    };

    const handleUndoComplete = async (date: DateInterface) => {
        try {
            await axiosConfig.patch(`/dates/${date._id}/toggle`, { done: false });
            toast.success(t("dates.messages.marked_pending"));
            fetchDates();
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "errors.update_failed"));
        }
    };

    const handleEdit = (date: DateInterface) => {
        setSelectedDate(date);
        setFormOpen(true);
    };

    const handleDelete = async (date: DateInterface) => {
        try {
            await axiosConfig.delete(`/dates/${date._id}`);
            toast.success(t("dates.messages.deleted"));
            fetchDates();
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "errors.delete_failed"));
        }
    };

    const handleCreate = () => {
        setSelectedDate(null);
        setFormOpen(true);
    };

    const handleFormSubmit = async (data: { title: string; notes: string; category: string }) => {
        try {
            if (selectedDate) {
                await axiosConfig.put(`/dates/${selectedDate._id}`, data);
                toast.success(t("dates.messages.updated"));
            } else {
                await axiosConfig.post("/dates", data);
                toast.success(t("dates.messages.created"));
            }
            fetchDates();
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "errors.save_failed"));
        }
    };

    const handleSortChange = (newSortBy: string, newSortOrder: string) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
    };

    const handleCreateCategory = async (data: { name: string; color: string }) => {
        try {
            await axiosConfig.post("/categories", data);
            toast.success(t("categories.messages.created"));
            await fetchCategories();
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "errors.save_failed"));
            throw error;
        }
    };

    if (loading && allDates.length === 0) {
        return <div className="flex justify-center p-8">{t("common.loading")}</div>;
    }

    return (
        <div className="container mx-auto p-4 pb-24 max-w-7xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {t("pages.dateIdeas.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {filteredDates.length} / {allDates.length} {t("dates.filters.results")}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCategoryManagerOpen(true)} className="gap-2">
                        <Settings className="h-4 w-4" />
                        {t("categories.manage.button")}
                    </Button>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t("dates.actions.add")}
                    </Button>
                </div>
            </div>

            <FilterBar
                categories={categories}
                selectedCategory={selectedCategory}
                selectedStatus={selectedStatus}
                sortBy={sortBy}
                sortOrder={sortOrder}
                searchQuery={searchQuery}
                pageSize={pageSize}
                onCategoryChange={setSelectedCategory}
                onStatusChange={setSelectedStatus}
                onSortChange={handleSortChange}
                onSearchChange={setSearchQuery}
                onPageSizeChange={setPageSize}
            />

            {filteredDates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>{searchQuery ? t("dates.empty.no_results") : t("dates.empty.title")}</p>
                    {!searchQuery && (
                        <Button variant="link" onClick={handleCreate}>
                            {t("dates.empty.action")}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDates.map((date) => (
                        <DateCard
                            key={date._id}
                            date={date}
                            onToggle={handleToggle}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            categoryColor={getCategoryColor(date.category)}
                        />
                    ))}
                </div>
            )}

            <DateForm
                open={formOpen}
                onOpenChange={setFormOpen}
                date={selectedDate}
                categories={categories}
                onSubmit={handleFormSubmit}
                onCreateCategory={handleCreateCategory}
                onImagesChange={(images) => {
                    if (selectedDate) {
                        setSelectedDate({ ...selectedDate, images });
                        setAllDates(prev => prev.map(d =>
                            d._id === selectedDate._id ? { ...d, images } : d
                        ));
                    }
                }}
            />

            <CompletionDialog
                open={completionOpen}
                onOpenChange={setCompletionOpen}
                date={selectedDate}
                onConfirm={handleComplete}
            />

            <CategoryManager
                open={categoryManagerOpen}
                onOpenChange={setCategoryManagerOpen}
                categories={categories}
                onCategoriesChange={fetchCategories}
            />
        </div>
    );
};
