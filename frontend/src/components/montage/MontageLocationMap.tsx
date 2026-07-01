import { useTranslation } from 'react-i18next';
import { MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MontageLocationMapProps {
  address?: string | null;
  city?: string | null;
  clientName?: string;
}

export function MontageLocationMap({ address, city, clientName }: MontageLocationMapProps) {
  const { t } = useTranslation();
  
  const fullAddress = [address, city].filter(Boolean).join(', ');
  
  if (!fullAddress) {
    return (
      <Card className="glass-card h-full">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('montages.location')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>{t('montages.no_address')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const encodedAddress = encodeURIComponent(fullAddress);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
  const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  
  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('montages.location')}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a
              href={mapLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('montages.open_in_maps')}
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
          <iframe
            src={mapEmbedUrl}
            title={`Map showing location of ${clientName || 'client'}`}
            className="w-full h-75"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{fullAddress}</span>
        </div>
      </CardContent>
    </Card>
  );
}
