import { getListingById } from "@/lib/listings";
import { getStayNights, getBusinessToday } from "@/lib/booking-dates";
import ApiForm from "@/components/ApiForm";

export default async function BookingConfirmPage({
  searchParams,
}: {
    searchParams: Promise<{
        listingId?: string | string[];
        checkIn?: string | string[];
        checkOut?: string | string[];
        guests?: string | string[];
    }>;
    }) {
    const params = await searchParams;

    if (
        typeof params.listingId !== "string" ||
        typeof params.checkIn !== "string" ||
        typeof params.checkOut !== "string" ||
        typeof params.guests !== "string"
    ) {
        return <main className="p-8">预订参数不完整，请返回房源详情。</main>;
    }

    const listingId = Number(params.listingId);
    const guests = Number(params.guests);
    const checkIn = params.checkIn;
    const checkOut = params.checkOut;

    if (!Number.isSafeInteger(listingId) || listingId < 1) {
        return <main className="p-8">房源编号不合法。</main>;
    }

    const listing = getListingById(listingId);

    if (!listing) {
        return <main className="p-8">房源不存在。</main>;
    }

    const nights = getStayNights(checkIn, checkOut);

    if (
        nights === null ||
        checkIn < getBusinessToday() ||
        !Number.isSafeInteger(guests) ||
        guests < 1 ||
        guests > Number(listing.max_guests)
    ) {
        return <main className="p-8">日期或人数不合法，请返回修改。</main>;
    }

    const nightlyPrice = Number(listing.price_per_night);

    // TODO 1：计算总价
    const totalPrice = nightlyPrice*nights;

    return (
        <main className="mx-auto max-w-lg px-6 py-12">
        <h1 className="text-3xl font-bold">确认预订</h1>

        <div className="mt-6 space-y-3">
            <h2 className="text-xl font-semibold">{String(listing.name)}</h2>
            <p>入住：{checkIn}</p>
            <p>退房：{checkOut}</p>
            <p>人数：{guests}</p>
            <p>每晚 ¥{nightlyPrice} × {nights} 晚</p>
            <p className="text-xl font-bold">总价：¥{totalPrice}</p>
        </div>

        <ApiForm action="/api/bookings" successHref="/trips" className="mt-8">
            <input type="hidden" name="listingId" value={String(listingId)} />
            <input type="hidden" name="checkIn" value={checkIn} />
            <input type="hidden" name="checkOut" value={checkOut} />
            <input type="hidden" name="guests" value={String(guests)} />
            <button
            type="submit"
            className="rounded-lg bg-rose-500 px-5 py-3 text-white"
            >
            确认预订
            </button>
        </ApiForm>

        <a
            href={`/listings/${listingId}`}
            className="mt-6 block text-rose-500"
        >
            返回修改
        </a>
        </main>
    );
    }