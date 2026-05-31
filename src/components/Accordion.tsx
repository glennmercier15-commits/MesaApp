import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppTheme } from "../theme/AppTheme";

interface AccordionProps {
  title: string;
  icon: React.ElementType;
  step: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function Accordion({ title, icon: Icon, step, isOpen, onToggle, children }: AccordionProps) {
  const { colors } = useAppTheme();

  return (
    <div className="space-y-2">
      <Card
        onClick={onToggle}
        className={cn(
          "border-0 shadow-sm rounded-[20px] cursor-pointer transition-all duration-300",
          isOpen ? "ring-2 ring-primary/20" : "hover:bg-primary/5"
        )}
        style={{ backgroundColor: colors.surfaceAlt }}
      >
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-background/50 shadow-sm">
              <Icon className="h-6 w-6" style={{ color: colors.primary }} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Step {step}</div>
              <div className="text-[15px] font-bold" style={{ color: colors.text }}>{title}</div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-5 w-5 opacity-30" />
          </motion.div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-1"
          >
            <div className="py-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
