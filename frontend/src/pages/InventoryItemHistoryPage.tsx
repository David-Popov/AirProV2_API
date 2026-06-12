import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Package,
  User,
  Clock,
  ArrowRight,
  Archive,
  Wrench,
  PackagePlus,
  PackageMinus,
  ArchiveRestore,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/shared';

import { inventoryService, inventoryAuditService } from '@/services';
import type { InventoryItem, InventoryAuditLog } from '@/types/inventory';
import { toast } from 'sonner';

const ACTION_ICONS = {
  Created: PackagePlus,
  Updated: Package,
  QuantityAdjusted: PackageMinus,
  UsedInMontage: Wrench,
  Archived: Archive,
  Restored: ArchiveRestore,
  Deleted: Package,
};

const ACTION_COLORS = {
  Created: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  QuantityAdjusted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  UsedInMontage: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  Restored: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  Deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function InventoryItemHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [logs, setLogs] = useState<InventoryAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, page]);

  const loadData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      if (!item) {
        try {
          const itemData = await inventoryService.getById(id);
          setItem(itemData);
        } catch (error) {
          console.error("Failed to load item", error);
        }
      }

      const historyData = await inventoryAuditService.getItemHistory(id, page, pageSize);
      setLogs(historyData.items);
      setTotalPages(historyData.total_pages);
      
    } catch (error) {
      console.error('Failed to load history', error);
      toast.error(t('inventory.error_loading', 'Failed to load inventory history'));
    } finally {
      setIsLoading(false);
    }
  };

  const getActionLabel = (action: InventoryAuditLog['action']) => {
    const labels: Record<string, string> = {
      Created: t('inventory.audit.actions.created'),
      Updated: t('inventory.audit.actions.updated'),
      QuantityAdjusted: t('inventory.audit.actions.quantityAdjusted'),
      UsedInMontage: t('inventory.audit.actions.usedInMontage'),
      Archived: t('inventory.audit.actions.archived'),
      Restored: t('inventory.audit.actions.restored'),
      Deleted: t('inventory.audit.actions.deleted'),
    };
    return labels[action] || action;
  };

  const formatDate = (dateString: string) => {
    try {
      const locale = i18n.language === 'bg' ? bg : enUS;
      return format(new Date(dateString), 'PP pp', { locale });
    } catch {
      return '';
    }
  };

  if (isLoading && !item && logs.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-14 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300">
      <div className="mb-6 sm:mb-8">
        <BackButton onClick={() => navigate('/inventory')} label={t('common.back', 'Back to Inventory')} />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
              {item ? item.name : t('inventory.audit.unknownItem')}
            </h1>
            <p className="text-muted-foreground mt-1">
              SKU: {item?.sku || '-'} • {t('inventory.audit.history')}
            </p>
          </div>
          
          {item && !item.is_active && (
            <Badge variant="outline" className="text-orange-500 border-orange-500/50 bg-orange-500/10 px-3 py-1">
              {t('common.inactive')}
            </Badge>
          )}
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('inventory.audit.history', 'History Log')}</CardTitle>
          <CardDescription>
            {t('inventory.audit.historyFor', { item: item?.name })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden sm:block" />

            <div className="space-y-8">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{t('inventory.audit.noActivity')}</p>
                </div>
              ) : (
                logs.map((log) => {
                  const Icon = ACTION_ICONS[log.action] || Package;
                  const colorClass = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800';
                  let date: Date;
                  try {
                    date = new Date(log.created_at);
                  } catch {
                     date = new Date();
                  }

                  return (
                     <div key={log.id} className="relative flex flex-col sm:flex-row gap-4 sm:gap-8">
                        <div className="absolute left-8 -translate-x-1/2 mt-1.5 w-3 h-3 rounded-full bg-border ring-4 ring-background hidden sm:block" />

                        <div className="sm:hidden text-xs text-muted-foreground mb-1 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {formatDate(log.created_at)}
                        </div>

                        <div className="hidden sm:block w-32 shrink-0 text-sm text-muted-foreground text-right pt-1">
                           <div className="font-medium text-foreground">{format(date, 'P')}</div>
                           <div className="text-xs">{format(date, 'p')}</div>
                        </div>

                        <div className="flex-1 pb-4 sm:pb-0 border-b sm:border-0 border-border last:border-0">
                           <Card className="border shadow-none bg-muted/20">
                              <CardContent className="p-4">
                                 <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                                       <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                          <div className="font-semibold text-foreground">
                                             {getActionLabel(log.action)}
                                          </div>
                                          {log.quantity_changed !== null && log.quantity_changed !== undefined && (
                                              <Badge variant={log.quantity_changed > 0 ? "default" : "destructive"} 
                                                     className={log.quantity_changed > 0 ? "bg-green-500 hover:bg-green-600" : ""}>
                                                {log.quantity_changed > 0 ? '+' : ''}{log.quantity_changed}
                                              </Badge>
                                          )}
                                       </div>

                                       <div className="space-y-2">
                                          {log.details && (
                                             <p className="text-sm text-foreground/80">{log.details}</p>
                                          )}

                                          {log.reason && (
                                             <p className="text-sm text-muted-foreground italic">"{log.reason}"</p>
                                          )}

                                          {log.related_montage && (
                                            <div 
                                              className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer mt-1"
                                              onClick={() => navigate(`/montages/${log.related_montage_id}`)}
                                            >
                                              <Wrench className="w-3 h-3" />
                                              {t('inventory.audit.montage')}: {log.related_montage.client_name}
                                              <ArrowRight className="w-3 h-3" />
                                            </div>
                                          )}

                                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                                            <User className="w-3 h-3" />
                                            <span>
                                              {log.user?.full_name || log.user?.email || t('inventory.audit.system')}
                                            </span>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </CardContent>
                           </Card>
                        </div>
                     </div>
                  );
                })
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setPage(p => Math.max(1, p - 1))}
                   disabled={page === 1}
                 >
                   {t('common.previous')}
                 </Button>
                 <span className="flex items-center px-4 text-sm text-muted-foreground">
                   {t('common.page', { current: page, total: totalPages })}
                 </span>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                   disabled={page === totalPages}
                 >
                   {t('common.next')}
                 </Button>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
