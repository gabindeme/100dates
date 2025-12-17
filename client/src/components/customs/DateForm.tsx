import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { DateInterface } from "@/interfaces/Dates";
import { CategoryInterface } from "@/interfaces/Category";
import { Plus, X } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

interface DateFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: DateInterface | null;
    categories: CategoryInterface[];
    onSubmit: (data: { title: string; notes: string; category: string }) => void;
    onCreateCategory?: (data: { name: string; color: string }) => Promise<void>;
    onImagesChange?: (images: string[]) => void;
}

const COLOR_PRESETS = [
    "#ec4899", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ef4444"
];

export const DateForm = ({ open, onOpenChange, date, categories, onSubmit, onCreateCategory, onImagesChange }: DateFormProps) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState("");

    // New category form state
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryColor, setNewCategoryColor] = useState("#6366f1");
    const [creatingCategory, setCreatingCategory] = useState(false);

    useEffect(() => {
        if (date) {
            setTitle(date.title);
            setNotes(date.notes || "");
            setCategory(date.category);
        } else {
            setTitle("");
            setNotes("");
            setCategory(categories[0]?.name || "");
        }
        setShowNewCategory(false);
        setNewCategoryName("");
        setNewCategoryColor("#6366f1");
    }, [date, categories, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !category) return;
        onSubmit({ title: title.trim(), notes: notes.trim(), category });
        onOpenChange(false);
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim() || !onCreateCategory) return;

        setCreatingCategory(true);
        try {
            await onCreateCategory({ name: newCategoryName.trim(), color: newCategoryColor });
            setCategory(newCategoryName.trim());
            setShowNewCategory(false);
            setNewCategoryName("");
        } finally {
            setCreatingCategory(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {date ? t('dates.form.edit_title') : t('dates.form.create_title')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">{t('dates.form.name')} *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('dates.form.name_placeholder')}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">{t('dates.form.note')}</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('dates.form.note_placeholder')}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="category">{t('dates.form.category')} *</Label>
                            {!showNewCategory && onCreateCategory && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNewCategory(true)}
                                    className="h-7 text-xs gap-1"
                                >
                                    <Plus className="h-3 w-3" />
                                    {t('dates.form.new_category')}
                                </Button>
                            )}
                        </div>

                        {showNewCategory ? (
                            <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">{t('dates.form.create_category')}</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => setShowNewCategory(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder={t('dates.form.category_name_placeholder')}
                                />
                                <div className="space-y-2">
                                    <Label className="text-xs">{t('dates.form.category_color')}</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1 flex-wrap">
                                            {COLOR_PRESETS.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={`w-6 h-6 rounded-full border-2 transition-transform ${newCategoryColor === color ? 'border-foreground scale-110' : 'border-transparent'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setNewCategoryColor(color)}
                                                />
                                            ))}
                                        </div>
                                        <Input
                                            type="color"
                                            value={newCategoryColor}
                                            onChange={(e) => setNewCategoryColor(e.target.value)}
                                            className="w-10 h-8 p-0.5 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleCreateCategory}
                                    disabled={!newCategoryName.trim() || creatingCategory}
                                    className="w-full"
                                >
                                    {creatingCategory ? t('common.loading') : t('dates.form.add_category')}
                                </Button>
                            </div>
                        ) : (
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('dates.form.category_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
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
                        )}
                    </div>

                    {/* Image uploader - only for existing dates */}
                    {date && onImagesChange && (
                        <ImageUploader
                            dateId={date._id}
                            images={date.images || []}
                            onImagesChange={onImagesChange}
                        />
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={showNewCategory}>
                            {date ? t('common.save') : t('common.create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
