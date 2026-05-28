import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Shield, Star, Calendar, Truck, Package, User, ChevronLeft,
  ChevronRight, MessageSquare, Info
} from 'lucide-react';
import { format } from 'date-fns';

const conditionMap = {
  new: { bg: 'Нов', en: 'New', color: 'bg-green-100 text-green-700' },
  like_new: { bg: 'Като нов', en: 'Like New', color: 'bg-blue-100 text-blue-700' },
  good: { bg: 'Добро', en: 'Good', color: 'bg-yellow-100 text-yellow-700' },
  fair: { bg: 'Задоволително', en: 'Fair', color: 'bg-orange-100 text-orange-700' },
  worn: { bg: 'Износен', en: 'Worn', color: 'bg-red-100 text-red-700' },
};

export default function ListingDetail() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const [currentImage, setCurrentImage] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id });
      return listings[0];
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['listing-reviews', id],
    queryFn: () => base44.entities.Review.filter({ listing_id: id }),
    enabled: !!id,
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-heading font-semibold text-xl">{lang === 'bg' ? 'Обявата не е намерена' : 'Listing not found'}</h2>
      </div>
    );
  }

  const images = listing.images?.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop'];
  const cond = conditionMap[listing.condition] || {};
  const isOwner = user?.email === listing.owner_email;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Back */}
      <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> {lang === 'bg' ? 'Обратно' : 'Back'}
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Images - 3 cols */}
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
            <img src={images[currentImage]} alt={listing.title} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage(i => (i > 0 ? i - 1 : images.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImage(i => (i < images.length - 1 ? i + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setCurrentImage(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {listing.is_insured && (
                <Badge className="bg-primary/90 text-white gap-1"><Shield className="w-3 h-3" />{t('listing.insured')}</Badge>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === currentImage ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mt-8">
            <h3 className="font-heading font-semibold text-lg mb-3">{lang === 'bg' ? 'Описание' : 'Description'}</h3>
            <p className="text-muted-foreground leading-relaxed">{listing.description || (lang === 'bg' ? 'Няма описание.' : 'No description.')}</p>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mt-8">
              <h3 className="font-heading font-semibold text-lg mb-4">{t('listing.reviews')} ({reviews.length})</h3>
              <div className="space-y-4">
                {reviews.slice(0, 5).map(r => (
                  <div key={r.id} className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{r.reviewer_name}</span>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 2 cols */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24 shadow-lg border-border/50">
            <CardContent className="p-6">
              <h1 className="font-heading text-2xl font-bold mb-2">{listing.title}</h1>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                {listing.condition && (
                  <Badge className={cond.color}>{lang === 'bg' ? cond.bg : cond.en}</Badge>
                )}
                {listing.brand && <Badge variant="outline">{listing.brand} {listing.model || ''}</Badge>}
                {listing.location_city && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> {listing.location_city}
                  </span>
                )}
              </div>

              {listing.rating_avg > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(listing.rating_avg) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{listing.rating_avg.toFixed(1)} ({listing.rating_count})</span>
                </div>
              )}

              <Separator className="my-4" />

              {/* Pricing */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-heading font-bold gradient-text">
                    {listing.daily_price?.toFixed(0)} €
                  </span>
                  <span className="text-muted-foreground text-sm">{t('listing.per_day')}</span>
                </div>
                {listing.weekly_price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('listing.per_week')}</span>
                    <span className="font-medium">{listing.weekly_price.toFixed(0)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('listing.deposit')}</span>
                  <span className="font-medium">{listing.deposit_amount?.toFixed(0)} €</span>
                </div>
                {listing.is_insured && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-primary" /> {t('booking.insurance')}
                    </span>
                    <span className="font-medium">{listing.insurance_price?.toFixed(0)} €</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Delivery */}
              <div>
                <h4 className="font-semibold text-sm mb-2">{t('listing.delivery')}</h4>
                <div className="space-y-1.5">
                  {listing.delivery_pickup && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" /> {t('listing.pickup')}
                    </div>
                  )}
                  {listing.delivery_owner && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="w-4 h-4" /> {t('listing.owner_delivery')}
                    </div>
                  )}
                  {listing.delivery_courier && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="w-4 h-4" /> {t('listing.courier')}
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Owner */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{listing.owner_name || 'Owner'}</p>
                  {listing.is_business && <Badge variant="secondary" className="text-[10px] mt-0.5">Business</Badge>}
                </div>
              </div>

              {/* Actions */}
              {!isOwner && (
                <div className="space-y-3">
                  <Link to={`/book/${listing.id}`} className="block">
                    <Button className="w-full gradient-bg text-white border-0 h-12 text-base rounded-xl shadow-lg">
                      {t('listing.book_now')}
                    </Button>
                  </Link>
                  <Link to={`/listing/${listing.id}/chat`} className="block">
                    <Button variant="outline" className="w-full h-10 rounded-xl gap-2">
                      <MessageSquare className="w-4 h-4" /> {t('listing.contact_owner')}
                    </Button>
                  </Link>
                </div>
              )}

              {isOwner && (
                <Link to={`/edit-listing/${listing.id}`}>
                  <Button variant="outline" className="w-full h-10 rounded-xl">
                    {t('common.edit')}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}