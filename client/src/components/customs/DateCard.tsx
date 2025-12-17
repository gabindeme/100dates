import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DateInterface } from "@/interfaces/Dates";
import { Pencil, Trash2, Calendar, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DateCardProps {
    date: DateInterface;
    onToggle: (date: DateInterface) => void;
    onEdit: (date: DateInterface) => void;
    onDelete: (date: DateInterface) => void;
    categoryColor?: string;
}

export const DateCard = ({ date, onToggle, onEdit, onDelete, categoryColor }: DateCardProps) => {
    const { t } = useTranslation();

    return (
        <Card
            className={`hover:shadow-lg transition-all duration-300 border-l-4 ${date.done ? 'opacity-75' : ''}`}
            style={{ borderLeftColor: categoryColor || '#6366f1' }}
        >
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                        checked={date.done}
                        onCheckedChange={() => onToggle(date)}
                        className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                        <CardTitle className={`text-lg ${date.done ? 'line-through text-muted-foreground' : ''}`}>
                            {date.title}
                        </CardTitle>
                        <span
                            className="inline-block px-2 py-0.5 text-xs rounded-full mt-1"
                            style={{
                                backgroundColor: categoryColor ? `${categoryColor}20` : '#6366f120',
                                color: categoryColor || '#6366f1'
                            }}
                        >
                            {date.category}
                        </span>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(date)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(date)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {date.notes && (
                    <div className="flex items-start gap-2 mb-3 p-2 bg-muted/50 rounded-md">
                        <Quote className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-sm italic text-muted-foreground">{date.notes}</p>
                    </div>
                )}
                <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${date.done ? 'text-green-600' : 'text-amber-600'}`}>
                        {date.done ? t('dates.status.completed') : t('dates.status.pending')}
                    </span>
                    {date.date_realised && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(date.date_realised).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
