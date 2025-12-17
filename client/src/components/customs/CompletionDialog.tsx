import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { DateInterface } from "@/interfaces/Dates";

interface CompletionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: DateInterface | null;
    onConfirm: (date: DateInterface, realisationDate: string) => void;
}

export const CompletionDialog = ({ open, onOpenChange, date, onConfirm }: CompletionDialogProps) => {
    const { t } = useTranslation();
    const [realisationDate, setRealisationDate] = useState(new Date().toISOString().split('T')[0]);

    const handleConfirm = () => {
        if (date) {
            onConfirm(date, realisationDate);
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('dates.completion.title')}</DialogTitle>
                    <DialogDescription>
                        {t('dates.completion.description', { title: date?.title })}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="realisation-date">{t('dates.completion.date_label')}</Label>
                    <Input
                        id="realisation-date"
                        type="date"
                        value={realisationDate}
                        onChange={(e) => setRealisationDate(e.target.value)}
                        className="mt-2"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleConfirm}>
                        {t('dates.completion.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
