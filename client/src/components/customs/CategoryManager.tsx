import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { CategoryInterface } from "@/interfaces/Category";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X, Check, Loader2 } from "lucide-react";

interface CategoryManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: CategoryInterface[];
    onCategoriesChange: () => void;
}

const COLOR_PRESETS = [
    "#ec4899", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ef4444",
    "#10b981", "#14b8a6", "#6366f1", "#a855f7",
    "#f43f5e", "#84cc16", "#0ea5e9", "#64748b"
];

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-foreground/20 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: color }}
                />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
                <div className="grid grid-cols-4 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${color === preset ? 'border-foreground scale-110' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: preset }}
                            onClick={() => onChange(preset)}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Input
                        type="color"
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-10 h-8 p-0.5 cursor-pointer"
                    />
                    <Input
                        type="text"
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                        className="flex-1 h-8 font-mono text-sm"
                        placeholder="#000000"
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
};

export const CategoryManager = ({ open, onOpenChange, categories, onCategoriesChange }: CategoryManagerProps) => {
    const { t } = useTranslation();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");
    const [loading, setLoading] = useState<string | null>(null);

    // New category state
    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState("#6366f1");

    const startEdit = (cat: CategoryInterface) => {
        setEditingId(cat._id);
        setEditName(cat.name);
        setEditColor(cat.color);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
        setEditColor("");
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return;
        setLoading(id);
        try {
            await axiosConfig.put(`/categories/${id}`, {
                name: editName.trim(),
                color: editColor
            });
            toast.success(t("categories.messages.updated"));
            onCategoriesChange();
            cancelEdit();
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "errors.update_failed"));
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async (cat: CategoryInterface) => {
        if (cat.isDefault) {
            toast.error(t("categories.errors.cannot_delete_default"));
            return;
        }

        setLoading(cat._id);
        try {
            await axiosConfig.delete(`/categories/${cat._id}`);
            toast.success(t("categories.messages.deleted"));
            onCategoriesChange();
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "errors.delete_failed"));
        } finally {
            setLoading(null);
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setLoading("new");
        try {
            await axiosConfig.post("/categories", {
                name: newName.trim(),
                color: newColor
            });
            toast.success(t("categories.messages.created"));
            onCategoriesChange();
            setShowNew(false);
            setNewName("");
            setNewColor("#6366f1");
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "errors.create_failed"));
        } finally {
            setLoading(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[80vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle>{t("categories.manage.title")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-2 py-4">
                    {categories.map((cat) => (
                        <div
                            key={cat._id}
                            className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 rounded-lg border bg-card"
                        >
                            {editingId === cat._id ? (
                                // Edit mode
                                <>
                                    <ColorPicker color={editColor} onChange={setEditColor} />
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 min-w-[120px] h-9"
                                        autoFocus
                                    />
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9"
                                            onClick={() => handleUpdate(cat._id)}
                                            disabled={loading === cat._id}
                                        >
                                            {loading === cat._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4 text-green-500" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9"
                                            onClick={cancelEdit}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                // Display mode
                                <>
                                    <div
                                        className="w-8 h-8 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="flex-1 font-medium">{cat.name}</span>
                                    {cat.isDefault && (
                                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                                            {t("categories.manage.default")}
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={() => startEdit(cat)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    {!cat.isDefault && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(cat)}
                                            disabled={loading === cat._id}
                                        >
                                            {loading === cat._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    ))}

                    {/* New category form */}
                    {showNew ? (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 rounded-lg border border-dashed border-primary/50 bg-primary/5">
                            <ColorPicker color={newColor} onChange={setNewColor} />
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={t("categories.manage.name_placeholder")}
                                className="flex-1 min-w-[120px] h-9"
                                autoFocus
                            />
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={handleCreate}
                                    disabled={loading === "new" || !newName.trim()}
                                >
                                    {loading === "new" ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4 text-green-500" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => { setShowNew(false); setNewName(""); }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => setShowNew(true)}
                        >
                            <Plus className="h-4 w-4" />
                            {t("categories.manage.add")}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
