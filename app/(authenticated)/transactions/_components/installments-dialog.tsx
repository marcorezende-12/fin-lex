import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { cn, formatCurrency } from "@/app/_lib/utils";

export interface InstallmentData {
  number: number;
  date: Date;
  value: number;
  isEdited?: boolean;
}

interface InstallmentsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  defaultAmount: number;
  defaultInstallmentsCount: number | undefined;
  defaultStartDate: Date;
  initialInstallmentsData?: InstallmentData[];
  onSave: (
    data: InstallmentData[],
    amount: number,
    installmentsCount: number,
    startDate: Date,
  ) => void;
}

export function InstallmentsDialog({
  isOpen,
  setIsOpen,
  defaultAmount,
  defaultInstallmentsCount,
  defaultStartDate,
  initialInstallmentsData,
  onSave,
}: InstallmentsDialogProps) {
  const [localAmount, setLocalAmount] = useState<number>(0);
  const [localInstallmentsCount, setLocalInstallmentsCount] = useState<
    number | undefined
  >(undefined);
  const [localStartDate, setLocalStartDate] = useState<Date>(new Date());

  const [installments, setInstallments] = useState<InstallmentData[]>([]);
  const [editingValueIndex, setEditingValueIndex] = useState<number | null>(
    null,
  );
  const [editValue, setEditValue] = useState<string>("");
  const [isHeaderDatePopoverOpen, setIsHeaderDatePopoverOpen] = useState(false);
  // Só uma linha por vez pode ter o popover de data aberto.
  const [openRowDatePopoverIndex, setOpenRowDatePopoverIndex] = useState<
    number | null
  >(null);

  // To prevent overriding initial data when the dialog opens, we track if it's a manual edit.
  const [isUserEditingHeader, setIsUserEditingHeader] = useState(false);

  const [debouncedAmount, setDebouncedAmount] = useState<number>(0);
  const [debouncedInstallmentsCount, setDebouncedInstallmentsCount] = useState<
    number | undefined
  >(undefined);
  const [debouncedStartDate, setDebouncedStartDate] = useState<Date>(
    new Date(),
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAmount(localAmount);
      setDebouncedInstallmentsCount(localInstallmentsCount);
      setDebouncedStartDate(localStartDate);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [localAmount, localInstallmentsCount, localStartDate]);

  useEffect(() => {
    if (isOpen) {
      setIsUserEditingHeader(false); // Reset on open
      setLocalAmount(defaultAmount);
      setLocalInstallmentsCount(defaultInstallmentsCount);
      setLocalStartDate(defaultStartDate);
      setDebouncedAmount(defaultAmount);
      setDebouncedInstallmentsCount(defaultInstallmentsCount);
      setDebouncedStartDate(defaultStartDate);

      if (
        initialInstallmentsData &&
        defaultInstallmentsCount &&
        initialInstallmentsData.length === defaultInstallmentsCount
      ) {
        setInstallments(initialInstallmentsData);
      } else if (defaultInstallmentsCount && defaultInstallmentsCount > 0) {
        generateInstallments(
          defaultAmount,
          defaultInstallmentsCount,
          defaultStartDate,
        );
      } else {
        setInstallments([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isUserEditingHeader) return;

    // Only generate if count is valid to prevent huge lag if user types too many zeros before max validation
    if (debouncedInstallmentsCount && debouncedInstallmentsCount > 360) {
      generateInstallments(debouncedAmount, 360, debouncedStartDate);
    } else {
      generateInstallments(
        debouncedAmount,
        debouncedInstallmentsCount,
        debouncedStartDate,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAmount, debouncedInstallmentsCount, debouncedStartDate]);

  const generateInstallments = (
    amount: number,
    count: number | undefined,
    startDate: Date,
  ) => {
    if (!count || count <= 0 || amount <= 0) {
      setInstallments([]);
      return;
    }

    const baseValue = amount / count;
    const newInstallments: InstallmentData[] = Array.from(
      { length: count },
      (_, i) => ({
        number: i + 1,
        date: addMonths(startDate, i),
        value: Number(baseValue.toFixed(2)),
        isEdited: false,
      }),
    );

    const totalSoFar = newInstallments.reduce((acc, curr, idx) => {
      if (idx === newInstallments.length - 1) return acc;
      return acc + curr.value;
    }, 0);

    newInstallments[newInstallments.length - 1].value = Number(
      (amount - totalSoFar).toFixed(2),
    );

    setInstallments(newInstallments);
  };

  const handleEditValueClick = (index: number, currentValue: number) => {
    setEditingValueIndex(index);
    setEditValue(currentValue.toFixed(2).replace(".", ","));
  };

  const handleSaveValueEdit = (index: number) => {
    const numericValue = Number(editValue.replace(/\./g, "").replace(",", "."));

    if (isNaN(numericValue) || numericValue < 0) {
      setEditingValueIndex(null);
      return;
    }

    const updatedInstallments = [...installments];
    updatedInstallments[index].value = numericValue;
    updatedInstallments[index].isEdited = true;

    let fixedTotal = 0;
    let remainingCount = 0;

    updatedInstallments.forEach((inst, idx) => {
      if (inst.isEdited || idx <= index) {
        if (idx <= index) {
          inst.isEdited = true;
        }
        fixedTotal += inst.value;
      } else {
        remainingCount++;
      }
    });

    const remainingAmount = debouncedAmount - fixedTotal;

    if (remainingCount > 0) {
      const newBaseValue = remainingAmount / remainingCount;
      let recalculatedTotalSoFar = 0;

      updatedInstallments.forEach((inst) => {
        if (!inst.isEdited) {
          inst.value = Number(newBaseValue.toFixed(2));
          recalculatedTotalSoFar += inst.value;
        }
      });

      if (remainingAmount > 0) {
        for (let i = updatedInstallments.length - 1; i >= 0; i--) {
          if (!updatedInstallments[i].isEdited) {
            const difference = remainingAmount - recalculatedTotalSoFar;
            updatedInstallments[i].value = Number(
              (updatedInstallments[i].value + difference).toFixed(2),
            );
            break;
          }
        }
      }
    }

    setInstallments(updatedInstallments);
    setEditingValueIndex(null);
  };

  const handleDateEdit = (index: number, newDate: Date | undefined) => {
    setOpenRowDatePopoverIndex(null);
    if (!newDate) return;
    const updatedInstallments = [...installments];
    updatedInstallments[index].date = newDate;
    setInstallments(updatedInstallments);
  };

  const handleConfirm = () => {
    onSave(
      installments,
      debouncedAmount,
      debouncedInstallmentsCount || 0,
      debouncedStartDate,
    );
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        scrollable={false}
        className="flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-center text-xl font-semibold">
            Configurar Parcela
          </DialogTitle>
          <DialogDescription className="text-center">
            Insira as informações abaixo
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid shrink-0 grid-cols-3 items-end gap-4">
          {/* VALOR */}
          <div className="flex flex-col justify-center space-y-2">
            <label className="text-sm leading-none font-medium">Valor *</label>
            <Input
              className="w-full"
              placeholder="R$ 0,00"
              value={localAmount > 0 ? formatCurrency(localAmount) : ""}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                const numericValue = Number(rawValue) / 100;
                setIsUserEditingHeader(true);
                setLocalAmount(numericValue);
              }}
            />
          </div>

          {/* NUMERO DE PARCELAS */}
          <div className="flex flex-col justify-center space-y-2">
            <label className="text-sm leading-none font-medium">
              Número de parcelas *
            </label>
            <Input
              className="w-full"
              type="text"
              inputMode="numeric"
              placeholder="Ex: 12"
              value={localInstallmentsCount || ""}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                // Limitar a no máximo 3 dígitos
                if (rawValue.length > 3) {
                  return; // Impede que a digitação passe de 3 dígitos
                }

                setIsUserEditingHeader(true);
                if (rawValue) {
                  setLocalInstallmentsCount(Number(rawValue));
                } else {
                  setLocalInstallmentsCount(undefined);
                }
              }}
            />
          </div>

          {/* DATA */}
          <div className="flex flex-col justify-center space-y-2">
            <label className="text-sm leading-none font-medium">Data *</label>
            <Popover
              open={isHeaderDatePopoverOpen}
              onOpenChange={setIsHeaderDatePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full cursor-pointer justify-start text-left font-normal",
                    !localStartDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {localStartDate ? (
                    format(localStartDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecionar Data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localStartDate}
                  onSelect={(date) => {
                    if (date) {
                      setIsUserEditingHeader(true);
                      setLocalStartDate(date);
                    }
                    setIsHeaderDatePopoverOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-8 min-h-0 flex-1 overflow-y-auto rounded-md border p-4">
          <h3 className="mb-4 text-sm font-semibold">Parcelamento</h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Parcela</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground h-24 text-center"
                  >
                    Preencha os dados acima para gerar as parcelas.
                  </TableCell>
                </TableRow>
              ) : (
                installments.map((installment, index) => (
                  <TableRow key={installment.number}>
                    <TableCell className="font-medium">
                      {installment.number}
                    </TableCell>
                    <TableCell>
                      <Popover
                        open={openRowDatePopoverIndex === index}
                        onOpenChange={(open) =>
                          setOpenRowDatePopoverIndex(open ? index : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-auto cursor-pointer justify-start px-2 font-normal"
                          >
                            <CalendarIcon className="mr-2 h-3 w-3 opacity-50" />
                            {format(installment.date, "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={installment.date}
                            onSelect={(date) => handleDateEdit(index, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        {editingValueIndex === index ? (
                          <Input
                            type="text"
                            className="h-8 w-28 text-right"
                            value={editValue}
                            onChange={(e) => {
                              const val = e.target.value.replace(
                                /[^0-9,]/g,
                                "",
                              );
                              setEditValue(val);
                            }}
                            onFocus={(e) => e.target.select()}
                            onBlur={() => handleSaveValueEdit(index)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveValueEdit(index);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <div className="flex w-full items-center justify-end">
                            <span>{formatCurrency(installment.value)}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleEditValueClick(index, installment.value)
                              }
                              className="text-muted-foreground hover:text-foreground ml-2 cursor-pointer transition-colors"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 grid w-full shrink-0 grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="w-full cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full cursor-pointer"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
