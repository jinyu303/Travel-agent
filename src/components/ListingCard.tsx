import Image from "next/image";
import type { ReactNode } from "react";
import { parseStringArray } from "@/lib/listing-json";

export default function ListingCard({
  listing,
  footer,
}: {
  listing: Record<string, unknown>;
  footer?: ReactNode;
}) {
  const images = parseStringArray(listing.images);
  const reviewCount = Number(listing.review_count);
  const name = String(listing.name);

  return (
    <article className="travel-hover-card overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm">
      <a href={`/listings/${String(listing.id)}`} className="block">
        {images.length > 0 ? (
          <Image
            //使用图片数组的第一项作为封面
            src={images[0]}
            alt={`${name}的演示图片`}
            width={800}
            height={600}
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-gray-100 text-gray-500">
            暂无图片
          </div>
        )}

        <div className="space-y-2 p-5">
          <h2 className="text-lg font-semibold">{name}</h2>

          <p className="text-sm text-gray-600">
            {String(listing.location)} · {String(listing.property_type)}
          </p>

          <p className="text-sm">
            {reviewCount > 0
              ? `★ ${Number(listing.rating).toFixed(1)} · ${reviewCount}条评论`
              : "暂无评分"}
          </p>

          <p className="text-sm text-gray-600">
            最多入住 {String(listing.max_guests)} 人
          </p>

          <p>
            <strong>¥{String(listing.price_per_night)}</strong>
            <span className="text-sm text-gray-600"> / 晚</span>
          </p>

          <p className="text-sm text-rose-500">查看详情与收藏</p>
        </div>
      </a>
      {footer && <div className="border-t border-gray-100 p-5">{footer}</div>}
    </article>
  );
}
