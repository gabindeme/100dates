import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryInterface } from "@/interfaces/Category";
import { useTranslation } from "react-i18next";
import { ArrowUpDown, Filter, Search } from "lucide-react";

interface FilterBarProps {
    categories: CategoryInterface[];
    selectedCategory: string;
    selectedStatus: string;
    sortBy: string;
    sortOrder: string;
    searchQuery: string;
    pageSize: string;
    onCategoryChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onSortChange: (sortBy: string, sortOrder: string) => void;
    onSearchChange: (value: string) => void;
    onPageSizeChange: (value: string) => void;
}

export const FilterBar = ({
    categories,
    selectedCategory,
    selectedStatus,
    sortBy,
    sortOrder,
    searchQuery,
    pageSize,
    onCategoryChange,
    onStatusChange,
    onSortChange,
    onSearchChange,
    onPageSizeChange,
}: FilterBarProps) => {
    const { t } = useTranslation();

    const handleSortToggle = () => {
        onSortChange(sortBy, sortOrder === "desc" ? "asc" : "desc");
    };

    return (
        <div className="space-y-4 mb-6">
            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t('dates.filters.search_placeholder')}
                    className="pl-10"
                />
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-3 items-center p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('dates.filters.title')}</span>
                </div>

                <Select value={selectedCategory} onValueChange={onCategoryChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('dates.filters.category')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('dates.filters.all_categories')}</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat.name}>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    {cat.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder={t('dates.filters.status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('dates.filters.all_status')}</SelectItem>
                        <SelectItem value="false">{t('dates.status.pending')}</SelectItem>
                        <SelectItem value="true">{t('dates.status.completed')}</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => onSortChange(value, sortOrder)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('dates.sort.title')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="title">{t('dates.sort.alphabetical')}</SelectItem>
                        <SelectItem value="createdAt">{t('dates.sort.creation_date')}</SelectItem>
                        <SelectItem value="date_realised">{t('dates.sort.realisation_date')}</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={handleSortToggle}>
                    <ArrowUpDown className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                </Button>

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t('dates.filters.show')}</span>
                    <Select value={pageSize} onValueChange={onPageSizeChange}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="75">75</SelectItem>
                            <SelectItem value="all">{t('dates.filters.all')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};
