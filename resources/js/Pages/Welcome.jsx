import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

function ActivityCard({ item, scheduleKey, accentClass }) {
    return (
        <article className="rounded-[1rem] border border-white/10 bg-white/95 p-3 shadow-[0_14px_28px_rgba(0,35,71,0.1)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                        {item.contract_id}
                    </p>
                    <p className="mt-2 text-sm font-bold leading-snug text-slate-900">
                        {item.title}
                    </p>
                </div>
                <div className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black text-white shadow-lg ${accentClass}`}>
                    {moment(item[scheduleKey]).format('hh:mm A')}
                </div>
            </div>
        </article>
    );
}

function ActivityColumn({ title, subtitle, items, scheduleKey, accentClass, emptyAccentClass }) {
    return (
        <section className="rounded-[1.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.06)_100%)] p-3 backdrop-blur">
            <div className="flex items-end justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
                        {subtitle}
                    </p>
                    <h2 className="mt-1.5 text-base font-black leading-none text-white">
                        {title}
                    </h2>
                </div>
                <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/88">
                    {items.length}
                </div>
            </div>

            <div className="mt-3 space-y-2">
                {items.length === 0 ? (
                    <div className={`rounded-[0.9rem] border border-dashed px-3 py-5 text-center text-xs font-semibold ${emptyAccentClass}`}>
                        No scheduled items for today
                    </div>
                ) : (
                    items.map((item) => (
                        <ActivityCard
                            key={`${title}-${item.id ?? item.contract_id}-${item.title}`}
                            item={item}
                            scheduleKey={scheduleKey}
                            accentClass={accentClass}
                        />
                    ))
                )}
            </div>
        </section>
    );
}

export default function Welcome({ auth }) {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [preBidConferences, setPreBidConferences] = useState([]);
    const [openingOfBids, setOpeningOfBids] = useState([]);

    useEffect(() => {
        let isMounted = true;

        axios.get('/api/contract_schedule/bidding')
            .then((res) => {
                if (!isMounted) {
                    return;
                }

                setPreBidConferences(res.data.pre_bid_conference ?? []);
                setOpeningOfBids(res.data.opening_of_bids ?? []);
            })
            .catch(() => {
                if (!isMounted) {
                    return;
                }

                setPreBidConferences([]);
                setOpeningOfBids([]);
            });

        const timer = window.setInterval(() => setCurrentDateTime(new Date()), 1000);

        return () => {
            isMounted = false;
            window.clearInterval(timer);
        };
    }, []);

    const totalActivities = useMemo(
        () => preBidConferences.length + openingOfBids.length,
        [preBidConferences.length, openingOfBids.length]
    );

    const isLoggedIn = Boolean(auth?.user);

    return (
        <>
            <Head title="Bulletin">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(0,63,125,0.34),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,142,0,0.22),transparent_26%),linear-gradient(135deg,#00162f_0%,#002347_36%,#003f7d_100%)]">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-[-8rem] top-[-6rem] h-[28rem] w-[28rem] rounded-full bg-sky-300/15 blur-3xl" />
                    <div className="absolute right-[-5rem] top-20 h-[24rem] w-[24rem] rounded-full bg-amber-300/20 blur-3xl" />
                    <div className="absolute bottom-[-8rem] left-1/3 h-[22rem] w-[22rem] rounded-full bg-cyan-200/10 blur-3xl" />
                </div>

                {!isLoggedIn && (
                    <div className="pointer-events-none absolute inset-x-0 top-8 flex justify-center">
                        <h1
                            className="select-none uppercase text-white/8"
                            style={{
                                fontSize: 'clamp(5rem, 13vw, 12rem)',
                                fontFamily: "'Anton', sans-serif",
                                letterSpacing: '0.18em',
                                lineHeight: 0.9,
                            }}
                        >
                            BidWatch
                        </h1>
                    </div>
                )}

                <div className="relative z-10 mx-auto flex h-screen max-h-screen w-full max-w-[1920px] flex-col overflow-hidden px-5 py-5 xl:px-8 xl:py-6">
                    <header className="shrink-0 rounded-[1rem] border border-white/10 bg-white/8 px-3 py-3 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur xl:px-4 xl:py-3">
                        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-[linear-gradient(135deg,#ff8e00_0%,#ff5003_100%)] text-lg font-black text-white shadow-[0_18px_40px_rgba(255,80,3,0.28)]">
                                    BW
                                </div>
                                <div>
                                    <p
                                        className="text-[9px] font-black uppercase tracking-[0.24em] text-white/60"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        Digital Information Bulletin
                                    </p>
                                    <h2
                                        className="mt-1 text-[1rem] font-black leading-none text-white xl:text-[1.2rem]"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        DPWH BidWatch Public Display
                                    </h2>
                                    <p className="mt-1 max-w-4xl text-[11px] leading-5 text-white/74">
                                        Real-time schedule visibility for visitors and office staff, featuring the day&apos;s pre-bid conferences and openings of bids.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-[0.9rem] border border-white/10 bg-white/10 px-3 py-2.5">
                                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/50">Date</p>
                                    <p className="mt-1.5 text-xs font-black text-white">
                                        {moment(currentDateTime).format('MMMM D, YYYY')}
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-white/68">
                                        {moment(currentDateTime).format('dddd')}
                                    </p>
                                </div>
                                <div className="rounded-[0.9rem] border border-white/10 bg-white/10 px-3 py-2.5">
                                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/50">Time</p>
                                    <p className="mt-1.5 text-sm font-black text-white">
                                        {currentDateTime.toLocaleTimeString()}
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-white/68">
                                        Live clock
                                    </p>
                                </div>
                                <div className="rounded-[0.9rem] border border-white/10 bg-white/10 px-3 py-2.5">
                                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/50">Today&apos;s Total</p>
                                    <p className="mt-1.5 text-sm font-black text-white">
                                        {totalActivities}
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-white/68">
                                        Scheduled activities
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="mt-3 grid min-h-0 flex-1 gap-3 xl:grid-cols-[1.85fr_0.55fr]">
                        <section className="min-h-0 rounded-[1.2rem] border border-white/10 bg-white/8 p-3 shadow-[0_28px_70px_rgba(0,0,0,0.18)] backdrop-blur xl:p-4">
                            <div className="flex h-full flex-col">
                                <div className="border-b border-white/10 pb-3">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/55">
                                        Office Feed
                                    </p>
                                    <h2 className="mt-1 text-[1.15rem] font-black leading-none text-white">
                                        Featured Public Display
                                    </h2>
                                    <p className="mt-1 text-[11px] leading-5 text-white/70">
                                        This video panel is the main focal point for the lobby screen and is sized to dominate the public display experience.
                                    </p>
                                </div>

                                <div className="mt-3 flex-[0_0_78%] overflow-hidden rounded-[1rem] border border-white/10 bg-slate-950/30 shadow-[0_20px_55px_rgba(0,0,0,0.24)]">
                                    <video
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="h-full min-h-[52vh] w-full object-cover xl:min-h-0"
                                    >
                                        <source src="../storage/videos/videoloop.mp4" type="video/mp4" />
                                    </video>
                                </div>

                            </div>
                        </section>

                        <aside className="min-h-0 rounded-[1.2rem] border border-white/10 bg-white/6 p-3 shadow-[0_28px_70px_rgba(0,0,0,0.18)] backdrop-blur xl:p-4">
                            <div className="grid h-full gap-3 overflow-hidden">
                                <ActivityColumn
                                    title="Pre-Bid Conference"
                                    subtitle="Today&apos;s Schedule"
                                    items={preBidConferences}
                                    scheduleKey="pre_bid_schedule"
                                    accentClass="bg-[linear-gradient(135deg,#ff8e00_0%,#ff5003_100%)]"
                                    emptyAccentClass="border-white/20 bg-white/5 text-white/72"
                                />
                                <ActivityColumn
                                    title="Opening of Bids"
                                    subtitle="Today&apos;s Schedule"
                                    items={openingOfBids}
                                    scheduleKey="opening_of_bids_schedule"
                                    accentClass="bg-[linear-gradient(135deg,#0ea5e9_0%,#003f7d_100%)]"
                                    emptyAccentClass="border-white/20 bg-white/5 text-white/72"
                                />
                            </div>
                        </aside>
                    </main>
                </div>
            </div>
        </>
    );
}
