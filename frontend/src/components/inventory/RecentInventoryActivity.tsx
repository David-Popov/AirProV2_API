import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { inventoryAuditService } from '@/services/inventoryAuditService';
import type { InventoryAuditLog } from '@/types/inventory';
import { 
  Package, 
  PackagePlus, 
  PackageMinus, 
  Archive, 
  ArchiveRestore, 
  Wrench,
  History,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';

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

export function RecentInventoryActivity() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<InventoryAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      setLoading(true);
      const data = await inventoryAuditService.getRecentActivity(6);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load recent inventory activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: InventoryAuditLog['action']) => {
    const labels = {
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

  const formatRelativeTime = (dateString: string) => {
    try {
      const locale = i18n.language === 'bg' ? bg : enUS;
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale });
    } catch (e) {
      return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('inventory.audit.recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('inventory.audit.recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {t('inventory.audit.noActivity')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          {t('inventory.audit.recentActivity')}
        </CardTitle>
        <CardDescription>{t('inventory.audit.recentActivityDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = ACTION_ICONS[activity.action] || Package;
            const colorClass = ACTION_COLORS[activity.action] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => activity.inventory_item_id && navigate(`/inventory/${activity.inventory_item_id}/history`)}
              >
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">
                      {activity.inventory_item?.name || t('inventory.audit.unknownItem')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getActionLabel(activity.action)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{activity.user?.full_name || activity.user?.email || t('inventory.audit.system')}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(activity.created_at)}</span>
                  </div>
                  {activity.quantity_changed !== null && activity.quantity_changed !== undefined && (
                    <div className="mt-1 text-xs">
                      <span className={activity.quantity_changed > 0 ? 'text-green-600' : 'text-red-600'}>
                        {activity.quantity_changed > 0 ? '+' : ''}{activity.quantity_changed}
                      </span>
                    </div>
                  )}
                  {activity.related_montage && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t('inventory.audit.montage')}: {activity.related_montage.client_name}
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            );
          })}
        </div>
        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => navigate('/inventory')}
        >
          {t('inventory.audit.viewAll')}
        </Button>
      </CardContent>
    </Card>
  );
}
