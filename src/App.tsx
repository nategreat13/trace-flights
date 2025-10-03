import React, { useMemo, useState, useEffect } from "react";
import { MotionConfig, motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ArrowRight,
  Plane,
  Sparkles,
  Map,
  BarChart3,
  ShieldCheck,
  Building2,
  ChevronDown,
  Pin,
  Home,
  MonitorPlay,
  Menu,
  X,
} from "lucide-react";
import { geoAlbersUsa } from "d3-geo";

// ---- TEMP: image placeholders for SLC grid ----
const slcImages = [
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=1200&auto=format&fit=crop",
];

// ---- Demo seasonal data (swap for API) ----
const monthlyRangeSLC = [
  { month: "Jan", low: 105, high: 215, cheapest: true },
  { month: "Feb", low: 120, high: 230 },
  { month: "Mar", low: 140, high: 260 },
  { month: "Apr", low: 135, high: 255 },
  { month: "May", low: 150, high: 290 },
  { month: "Jun", low: 180, high: 350 },
  { month: "Jul", low: 190, high: 360 },
  { month: "Aug", low: 175, high: 340 },
  { month: "Sep", low: 145, high: 280 },
  { month: "Oct", low: 130, high: 235 },
  { month: "Nov", low: 160, high: 300 },
  { month: "Dec", low: 145, high: 330, expensive: true },
];

// ---- Regions list for Explore & Map ----
const originsByRegion = [
  {
    region: "California",
    cities: [
      { code: "LAX", name: "Los Angeles", lat: 33.9416, lon: -118.4085 },
      { code: "SFO", name: "San Francisco", lat: 37.6213, lon: -122.379 },
      { code: "SAN", name: "San Diego", lat: 32.7338, lon: -117.1933 },
      { code: "SJC", name: "San Jose", lat: 37.3639, lon: -121.9289 },
      { code: "OAK", name: "Oakland", lat: 37.7126, lon: -122.2197 },
    ],
  },
  {
    region: "West",
    cities: [
      { code: "SEA", name: "Seattle", lat: 47.4502, lon: -122.3088 },
      { code: "PDX", name: "Portland", lat: 45.5898, lon: -122.5951 },
      { code: "PHX", name: "Phoenix", lat: 33.4353, lon: -112.0078 },
      { code: "DEN", name: "Denver", lat: 39.8561, lon: -104.6737 },
      { code: "LAS", name: "Las Vegas", lat: 36.084, lon: -115.1537 },
    ],
  },
  {
    region: "Midwest & East",
    cities: [
      { code: "ORD", name: "Chicago O'Hare", lat: 41.9742, lon: -87.9073 },
      { code: "MSP", name: "Minneapolis", lat: 44.8848, lon: -93.2223 },
      { code: "DFW", name: "Dallas/Fort Worth", lat: 32.8998, lon: -97.0403 },
      { code: "ATL", name: "Atlanta", lat: 33.6407, lon: -84.4277 },
      { code: "BOS", name: "Boston", lat: 42.3656, lon: -71.0096 },
    ],
  },
];

// ---- Lightweight mock for route details (LAX → SLC) ----
const routeDetail = {
  origin: {
    code: "LAX",
    city: "Los Angeles",
    popularAirports: [
      {
        code: "LAX",
        city: "Los Angeles",
        country: "United States",
        drive: "30 min",
        dist: "12 mi",
      },
      {
        code: "BUR",
        city: "Burbank",
        country: "United States",
        drive: "25 min",
        dist: "12 mi",
      },
      {
        code: "TIJ",
        city: "Tijuana",
        country: "Mexico",
        drive: "2 hr 24 min",
        dist: "127 mi",
      },
      {
        code: "ONT",
        city: "Ontario",
        country: "United States",
        drive: "46 min",
        dist: "37 mi",
      },
    ],
  },
  destination: {
    code: "SLC",
    city: "Salt Lake City",
    popularAirports: [
      {
        code: "SLC",
        city: "Salt Lake City",
        country: "United States",
        drive: "11 min",
        dist: "6 mi",
      },
      {
        code: "OGD",
        city: "Ogden",
        country: "United States",
        drive: "40 min",
        dist: "35 mi",
      },
      {
        code: "PVU",
        city: "Provo",
        country: "United States",
        drive: "45 min",
        dist: "43 mi",
      },
    ],
  },
  overview: {
    cheapestRoundTrip: {
      price: 142,
      airline: "Frontier",
      notes: "Nonstop · 5 hr",
      dates: "Sat, Nov 8 — Sat, Nov 15",
    },
    cheapestOneWay: {
      price: 76,
      airline: "Frontier",
      notes: "Nonstop · 5 hr",
      dates: "Sat, Nov 8",
    },
    lastMinuteWeekend: {
      price: 227,
      airline: "Frontier",
      notes: "1 stop · 9 hr",
      dates: "Thu, Oct 9 — Mon, Oct 13",
    },
    businessClass: {
      price: 587,
      airline: "Delta",
      notes: "1 stop · 9 hr",
      dates: "Sat, Nov 1 — Sat, Nov 8",
    },
    fastest: {
      time: "3 hr 50 min",
      blurb:
        "The fastest nonstop flight from Los Angeles to Salt Lake City takes 3 hr 50 min",
    },
    nonstop: {
      frequency: "Every day",
      blurb: "There are direct flights on this route every day.",
    },
  },
  airlines: [
    { name: "Southwest", nonstop: true, from: 215 },
    { name: "United", nonstop: true, from: 197 },
    { name: "American", nonstop: true, from: 197 },
    { name: "Delta", nonstop: false, from: 217 },
    { name: "Frontier", nonstop: true, from: 142 },
    { name: "Spirit", nonstop: true, from: 152 },
  ],
  faqs: [
    "When are the cheapest days to fly from Los Angeles to Salt Lake City?",
    "Which airlines provide the cheapest flights from Los Angeles to Salt Lake City?",
    "What are the cheapest flights from Los Angeles to Salt Lake City?",
    "How long does it take to fly from Los Angeles to Salt Lake City?",
    "When should you fly to Salt Lake City, United States?",
    "How do I find cheap dates to fly from Los Angeles to Salt Lake City?",
  ],
};

export default function TraceFlightsDMO() {
  const [view, setView] = useState<"home" | "demo">("home");
  const [selectedDestination] = useState("Salt Lake City, UT (SLC)");
  const [selectedOrigin, setSelectedOrigin] = useState({
    code: "LAX",
    name: "Los Angeles",
  });

  // Smooth scroll helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [view]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-cyan-50 to-rose-50">
        <Header
          onHome={() => setView("home")}
          onDemo={() => {
            setView("demo");
            setTimeout(() => scrollTo("demo"), 50);
          }}
          onPricing={() => {
            setView("home");
            setTimeout(() => scrollTo("pricing"), 50);
          }}
          onContact={() => {
            setView(view === "home" ? "home" : "demo");
            setTimeout(() => scrollTo("contact"), 50);
          }}
        />
        {view === "home" ? (
          <HomeView
            onDemo={() => setView("demo")}
            selectedDestination={selectedDestination}
          />
        ) : (
          <DemoView
            selectedOrigin={selectedOrigin}
            setSelectedOrigin={setSelectedOrigin}
            selectedDestination={selectedDestination}
          />
        )}
        <Footer />
      </div>
    </MotionConfig>
  );
}

// ---------------- HOME VIEW ----------------
function HomeView({
  onDemo,
  selectedDestination,
}: {
  onDemo: () => void;
  selectedDestination: string;
}) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute -top-28 -left-28 w-[40rem] h-[40rem] rounded-full bg-blue-200 blur-3xl opacity-40" />
        <div className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] rounded-full bg-cyan-200 blur-3xl opacity-40" />
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Flight pages that actually help travelers
            </h1>
            <p className="mt-4 text-neutral-700 text-lg max-w-xl">
              TraceFlights powers <b>live sample fares</b>,{" "}
              <b>seasonal price ranges</b>, and <b>nonstop origins</b> for
              destinations like {selectedDestination}. Built for Visit‑style
              DMOs, ready to white‑label.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onDemo}
                className="px-5 py-3 rounded-2xl shadow-sm bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium inline-flex items-center gap-2"
              >
                View SLC Demo <MonitorPlay className="w-4 h-4" />
              </button>
              <a
                href="#contact"
                className="px-5 py-3 rounded-2xl shadow-sm border bg-white hover:shadow transition text-sm font-medium inline-flex items-center gap-2"
              >
                Talk to us <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-neutral-700">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                White-label ready
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                SEO-friendly pages
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                API or embed
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-3 gap-3">
              {slcImages.map((src, i) => (
                <div
                  key={i}
                  className={`rounded-2xl overflow-hidden border shadow-sm ${
                    i === 0 ? "col-span-2 row-span-2 h-64" : "h-32"
                  }`}
                >
                  <img
                    src={src}
                    alt="Salt Lake placeholder"
                    onError={(e) => {
                      (
                        e.target as HTMLImageElement
                      ).src = `https://picsum.photos/seed/fallback${i}/800/600`;
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur border rounded-2xl px-4 py-2 text-xs shadow-sm">
              Image placeholders • Swap for SLC CDN later
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14" id="features">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Feature icon={<Map className="w-5 h-5" />} title="Origin explorer">
              Interactive map/list of feeder markets with direct-route insights
              and city-specific pages.
            </Feature>
            <Feature
              icon={<BarChart3 className="w-5 h-5" />}
              title="Seasonal price bands"
            >
              Travelers see typical low/high fares by month so they can pick the
              right time to visit.
            </Feature>
            <Feature
              icon={<Sparkles className="w-5 h-5" />}
              title="Live sample fares"
            >
              Show the latest 5 sample prices per route with deeplinks to Google
              Flights or your partner.
            </Feature>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="py-16 bg-gradient-to-b from-white to-blue-50/40 border-t"
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Pricing
          </h2>
          <p className="text-neutral-700 mt-2">
            Simple SaaS tiers. White-label page builds available on request.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <PricingCard
              title="Basic"
              price="$500/mo"
              bullets={[
                "Up to 20 origin pages",
                "Seasonal price bands",
                "5 live sample fares per route",
                "Embed or API access",
              ]}
              cta="Start with Basic"
            />
            <PricingCard
              title="Pro"
              price="$1,000/mo"
              bullets={[
                "Up to 50 origin pages",
                "Custom segments (e.g., California)",
                "Priority refresh cadence",
                "Analytics & export",
              ]}
              highlight
              cta="Go Pro"
            />
            <PricingCard
              title="Enterprise"
              price="Custom"
              bullets={[
                "100+ pages & multi-destination",
                "White-label build & hosting",
                "SLA & governance",
                "Dedicated support",
              ]}
              cta="Talk to sales"
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <ContactSection />
    </>
  );
}

// ---------------- DEMO VIEW ----------------
function DemoView({
  selectedOrigin,
  setSelectedOrigin,
  selectedDestination,
}: {
  selectedOrigin: { code: string; name: string };
  setSelectedOrigin: (o: any) => void;
  selectedDestination: string;
}) {
  const [query, setQuery] = useState("");
  const flatCities = useMemo(
    () => originsByRegion.flatMap((g) => g.cities),
    []
  );
  const filteredCities = useMemo(() => {
    if (!query.trim()) return flatCities;
    const q = query.trim().toLowerCase();
    return flatCities.filter(
      (c) =>
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [query, flatCities]);

  // Auto-populate the selected origin from what they're typing (first match)
  useEffect(() => {
    if (
      query &&
      filteredCities.length &&
      filteredCities[0].code !== selectedOrigin.code
    ) {
      setSelectedOrigin(filteredCities[0]);
    }
  }, [query, filteredCities, selectedOrigin.code, setSelectedOrigin]);

  return (
    <>
      {/* Intro */}
      <section className="py-10 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12">
              View your deals to SLC
            </h2>
            <p className="text-neutral-700 mt-4">
              Click a city on the mock map or choose from the list to preview a
              route page.
            </p>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop"
              alt="Scenic flight"
              className="w-full h-48 md:h-64 object-cover rounded-2xl border shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Mock Map */}
      <section id="explore" className="py-8">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-start">
          <MockMap
            onSelect={(c) => {
              setSelectedOrigin(c);
              const el = document.getElementById("demo");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            selected={{ code: selectedOrigin.code }}
            mapImageUrl={
              "https://www.dripuploads.com/uploads/image_upload/image/4572959/embeddable_173c0588-9441-4ad5-8cc3-7f349cb6d8a1.png"
            }
          />
          <div className="bg-white rounded-3xl border shadow-sm p-5">
            <h3 className="font-semibold">Origins list</h3>
            <p className="text-sm text-neutral-600 mt-1">
              Quick access to common feeder markets.
            </p>
            <div className="mt-3 relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm pr-9"
                placeholder="Search origin (city or code)…"
                aria-label="Search origin"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                /
              </span>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {(filteredCities.length ? filteredCities : flatCities).map(
                (c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setSelectedOrigin(c);
                      const el = document.getElementById("demo");
                      if (el)
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                    className={`px-3 py-2 rounded-xl border text-sm inline-flex items-center justify-between ${
                      c.code === selectedOrigin.code
                        ? "bg-blue-50 border-blue-300"
                        : "hover:bg-blue-50/40"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-neutral-600">
                      {c.code} → SLC
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Route detail */}
      <section
        id="demo"
        className="py-16 bg-gradient-to-b from-white to-blue-50/30 border-t"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Cheap flights from {selectedOrigin.name} ({selectedOrigin.code})
                to {routeDetail.destination.city} (
                {routeDetail.destination.code})
              </h2>
              <p className="text-neutral-700 mt-2 max-w-2xl">
                Useful information for finding cheap flights from{" "}
                {selectedOrigin.name} to {routeDetail.destination.city} and
                booking your next trip.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-neutral-600">Destination</label>
              <select
                value={selectedDestination}
                onChange={() => {}}
                className="text-sm px-3 py-2 border rounded-xl bg-white"
              >
                <option>Salt Lake City, UT (SLC)</option>
                <option>Denver, CO (DEN)</option>
                <option>Boise, ID (BOI)</option>
              </select>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard
              title="Cheapest round-trip"
              value={`$${routeDetail.overview.cheapestRoundTrip.price}`}
              note={`${routeDetail.overview.cheapestRoundTrip.airline} · ${routeDetail.overview.cheapestRoundTrip.notes}`}
              dates={routeDetail.overview.cheapestRoundTrip.dates}
            />
            <OverviewCard
              title="Cheapest one-way"
              value={`$${routeDetail.overview.cheapestOneWay.price}`}
              note={`${routeDetail.overview.cheapestOneWay.airline} · ${routeDetail.overview.cheapestOneWay.notes}`}
              dates={routeDetail.overview.cheapestOneWay.dates}
            />
            <OverviewCard
              title="Last-minute weekend"
              value={`$${routeDetail.overview.lastMinuteWeekend.price}`}
              note={`${routeDetail.overview.lastMinuteWeekend.airline} · ${routeDetail.overview.lastMinuteWeekend.notes}`}
              dates={routeDetail.overview.lastMinuteWeekend.dates}
            />
            <OverviewCard
              title="Cheapest business class"
              value={`$${routeDetail.overview.businessClass.price}`}
              note={`${routeDetail.overview.businessClass.airline} · ${routeDetail.overview.businessClass.notes}`}
              dates={routeDetail.overview.businessClass.dates}
            />
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <StatCard
              title="Fastest flight"
              value={routeDetail.overview.fastest.time}
              blurb={routeDetail.overview.fastest.blurb}
            />
            <StatCard
              title="Nonstop flights"
              value={routeDetail.overview.nonstop.frequency}
              blurb={routeDetail.overview.nonstop.blurb}
            />
          </div>

          {/* Seasonal ranges chart */}
          <div className="mt-8 bg-white border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                When is the cheapest time to fly?
              </h3>
              <span className="text-xs text-neutral-500">
                Cheapest month highlighted; typical economy fares
              </span>
            </div>
            <p className="text-sm text-neutral-700 mt-1">
              The cheapest month to fly is typically <b>January</b>. The most
              expensive month is typically <b>December</b>.
            </p>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyRangeSLC}
                  margin={{ top: 20, right: 60, left: 60, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="low" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#2563eb"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#2563eb"
                        stopOpacity={0.04}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" padding={{ left: 48, right: 48 }} />
                  <YAxis domain={[0, 400]} allowDataOverflow={false} />
                  <Tooltip formatter={(v) => `$${v}`} />
                  <Area
                    type="linear"
                    dataKey="low"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#low)"
                  />
                  <Area
                    type="linear"
                    dataKey="mid"
                    stroke="#1f2937"
                    fillOpacity={0}
                    strokeDasharray="4 4"
                    data={monthlyRangeSLC.map((m) => ({
                      month: m.month,
                      mid: Math.round((m.low + m.high) / 2),
                    }))}
                  />
                  <Area
                    type="linear"
                    dataKey="high"
                    stroke="#b91c1c"
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex gap-3 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border">
                January · Cheapest · $105-215
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border">
                December · Most expensive · $145-330
              </span>
            </div>
          </div>

          {/* Popular airlines */}
          <div className="mt-8 bg-white border rounded-3xl p-5 shadow-sm">
            <h3 className="font-semibold">
              Popular airlines from {selectedOrigin.name} to{" "}
              {routeDetail.destination.city}
            </h3>
            <div className="mt-4 grid md:grid-cols-3 lg:grid-cols-6 gap-3">
              {routeDetail.airlines.map((a, i) => (
                <div
                  key={i}
                  className="border rounded-2xl p-3 text-sm flex flex-col gap-1"
                >
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-neutral-600">
                    {a.nonstop ? "Nonstop" : "Varies"}
                  </div>
                  <div className="text-sm">
                    from <b>${a.from}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Airports */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <AirportsCard
              title={`Popular airports near ${routeDetail.origin.city}`}
              airports={routeDetail.origin.popularAirports}
            />
            <AirportsCard
              title={`Popular airports near ${routeDetail.destination.city}`}
              airports={routeDetail.destination.popularAirports}
            />
          </div>

          {/* FAQs */}
          <div
            className="mt-8 bg-white border rounded-3xl p-5 shadow-sm"
            id="faqs"
          >
            <h3 className="font-semibold">Frequently asked questions</h3>
            <div className="mt-3 divide-y">
              {routeDetail.faqs.map((q, i) => (
                <details key={i} className="py-3 group">
                  <summary className="list-none flex items-center justify-between cursor-pointer select-none">
                    <span className="text-sm">{q}</span>
                    <ChevronDown className="w-4 h-4 text-neutral-500 group-open:rotate-180 transition" />
                  </summary>
                  <p className="text-xs text-neutral-600 mt-2">
                    Demo copy. Replace with dynamic answers based on your
                    pricing and schedule data.
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact (demo end) */}
      <ContactSection />
    </>
  );
}

// ---------------- REUSABLES ----------------
function Header({
  onHome,
  onDemo,
  onPricing,
  onContact,
}: {
  onHome: () => void;
  onDemo: () => void;
  onPricing: () => void;
  onContact: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/85 border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600 text-white">
            <Plane className="w-5 h-5" />
          </div>
          <span className="font-semibold tracking-tight">TraceFlights</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            DMO
          </span>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <button
            onClick={onHome}
            className="inline-flex items-center gap-1 hover:underline"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={onDemo}
            className="inline-flex items-center gap-1 hover:underline"
          >
            <MonitorPlay className="w-4 h-4" />
            Demo
          </button>
          <button onClick={onPricing} className="hover:underline">
            Pricing
          </button>
          <button onClick={onContact} className="hover:underline">
            Contact
          </button>
        </nav>
        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onContact}
            className="hidden md:inline-flex items-center gap-1 text-sm font-medium"
          >
            Request a Demo <ArrowRight className="w-4 h-4" />
          </button>
          <button
            className="md:hidden p-2 rounded-xl border"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 grid gap-2 text-sm">
            <button
              onClick={() => {
                setOpen(false);
                onHome();
              }}
              className="text-left px-3 py-2 rounded-xl hover:bg-neutral-50 inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDemo();
              }}
              className="text-left px-3 py-2 rounded-xl hover:bg-neutral-50 inline-flex items-center gap-2"
            >
              <MonitorPlay className="w-4 h-4" />
              Demo
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onPricing();
              }}
              className="text-left px-3 py-2 rounded-xl hover:bg-neutral-50"
            >
              Pricing
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onContact();
              }}
              className="text-left px-3 py-2 rounded-xl hover:bg-neutral-50"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <img
              src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop"
              alt="Flight deals demo"
              className="w-full h-32 md:h-40 object-cover rounded-2xl border shadow-sm mb-4"
            />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Request a demo
            </h2>
            <p className="text-neutral-700 mt-2">
              Tell us your destination and target origins. We'll spin up a
              working preview on a white‑label URL or provide embed code.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5" />
                Fast setup—no dev time required
              </li>
              <li className="flex items-start gap-2">
                <Building2 className="w-4 h-4 mt-0.5" />
                Perfect for Visit‑style DMOs
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5" />
                Privacy‑safe, no PII collected
              </li>
            </ul>
          </div>
          <form className="bg-white border rounded-3xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Name" placeholder="Jane Doe" />
              <FormField label="Organization" placeholder="Visit Salt Lake" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                label="Work email"
                placeholder="jane@visitsaltlake.com"
              />
              <FormField
                label="Phone (optional)"
                placeholder="(555) 555-1234"
              />
            </div>
            <div className="mt-4">
              <FormField label="Destination" placeholder="Salt Lake City, UT" />
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">
                Target origins (comma-separated)
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                rows={3}
                placeholder="e.g., Los Angeles, San Francisco, Seattle, Phoenix"
              />
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Message</label>
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                rows={4}
                placeholder="Tell us about your use case and how many pages you need."
              />
            </div>
            <button
              type="button"
              className="mt-6 w-full px-5 py-3 rounded-2xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Request a demo
            </button>
            <p className="text-xs text-neutral-500 mt-3">
              This is a demo form. Hook up your CRM (HubSpot, Salesforce) or
              email via API.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function MockMap({
  onSelect,
  selected,
  mapImageUrl,
}: {
  onSelect: (c: any) => void;
  selected: { code: string };
  mapImageUrl?: string;
}) {
  const cities = originsByRegion.flatMap((g) => g.cities);
  const [hover, setHover] = useState<string | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (c: any) => {
    setPulse(c.code);
    onSelect(c);
    setTimeout(() => setPulse(null), 700);
  };

  // Projection (Albers USA) aligned to our SVG viewBox size
  const width = 160,
    height = 100;
  const projection = useMemo(
    () =>
      geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(150),
    []
  );

  const slc = { lat: 40.7899, lon: -111.9791 };
  const slcXY = projection([slc.lon, slc.lat]) || [90, 58];

  return (
    <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl shadow-sm border overflow-hidden">
      <div className="p-4 flex items-center justify-between text-white">
        <div className="font-semibold flex items-center gap-2">
          <Map className="w-4 h-4" /> Mock origin map
        </div>
        <div className="text-xs opacity-90">
          Hover pins · Click to preview route
        </div>
      </div>
      <div className="bg-white/10">
        <svg
          viewBox="0 0 160 100"
          className="w-full h-[360px]"
          onMouseMove={(e) => {
            const rect = (
              e.currentTarget as SVGSVGElement
            ).getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * width;
            const y = ((e.clientY - rect.top) / rect.height) * height;
            setMouse({ x, y });
          }}
          onMouseLeave={() => setMouse(null)}
        >
          <defs>
            <radialGradient id="g" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect x="0" y="0" width="160" height="100" fill="url(#g)" />
          {mapImageUrl ? (
            <image
              href={mapImageUrl}
              x={0}
              y={0}
              width={width}
              height={height}
              preserveAspectRatio="xMidYMid meet"
            />
          ) : (
            <path
              d="M8,60 L18,46 L30,40 L42,36 L55,38 L70,41 L86,44 L104,48 L120,52 L138,58 L150,66 L144,78 L126,84 L110,82 L94,78 L76,74 L60,70 L44,68 L28,66 L16,64 Z"
              fill="#e5e7eb"
              stroke="#9ca3af"
              strokeWidth="0.6"
            />
          )}
          {/* SLC pin */}
          <circle
            cx={slcXY[0]}
            cy={slcXY[1]}
            r={3.2}
            fill="#fcd34d"
            stroke="#111827"
          />
          <text x={slcXY[0] + 2} y={slcXY[1] - 2} fontSize="3" fill="#111827">
            SLC
          </text>

          {/* cursor-follow highlight */}
          {mouse && (
            <g>
              <circle
                cx={mouse.x}
                cy={mouse.y}
                r={3}
                fill="#ffffff"
                opacity="0.12"
              />
              <circle
                cx={mouse.x}
                cy={mouse.y}
                r={3.8}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="0.6"
                opacity="0.5"
              />
            </g>
          )}

          {/* city pins */}
          {cities.map((c, i) => {
            const xy = c.lon && c.lat ? projection([c.lon, c.lat]) : null;
            const [cx, cy] = xy || [0, 0];
            return (
              <motion.g
                key={i}
                className="cursor-pointer group transition-transform"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                onMouseEnter={() => setHover(c.code)}
                onMouseLeave={() => setHover(null)}
                onClick={() => handleClick(c)}
              >
                {hover === c.code && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4.2}
                    fill="#38bdf8"
                    opacity="0.25"
                    filter="url(#glow)"
                  />
                )}
                {pulse === c.code && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4.2}
                    className="animate-ping"
                    fill="#22c55e"
                    opacity="0.5"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={c.code === selected.code ? 2.9 : 2.4}
                  fill={c.code === selected.code ? "#ffffff" : "#e5e7eb"}
                  stroke="#111827"
                />
                <text x={cx + 2.8} y={cy - 1.2} fontSize="3" fill="#111827">
                  {c.code}
                </text>
                <line
                  x1={cx}
                  y1={cy}
                  x2={slcXY[0]}
                  y2={slcXY[1]}
                  stroke="#0ea5e9"
                  strokeOpacity={hover === c.code ? 0.95 : 0.65}
                  strokeDasharray="2 2"
                />
                <title>
                  {c.name} ({c.code}) → SLC
                </title>
              </motion.g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  note,
  dates,
}: {
  title: string;
  value: string;
  note: string;
  dates: string;
}) {
  return (
    <div className="rounded-3xl border p-4 shadow-sm bg-white">
      <div className="text-xs text-neutral-600">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs text-neutral-700 mt-1">{note}</div>
      <div className="text-xs text-neutral-500 mt-1">{dates}</div>
      <button className="mt-3 inline-flex items-center gap-1 text-sm underline">
        View flights <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function StatCard({
  title,
  value,
  blurb,
}: {
  title: string;
  value: string;
  blurb: string;
}) {
  return (
    <div className="rounded-3xl border p-4 shadow-sm bg-white">
      <div className="text-xs text-neutral-600">{title}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      <div className="text-xs text-neutral-700 mt-1">{blurb}</div>
    </div>
  );
}

function AirportsCard({
  title,
  airports,
}: {
  title: string;
  airports: {
    code: string;
    city: string;
    country: string;
    drive: string;
    dist: string;
  }[];
}) {
  return (
    <div className="bg-white border rounded-3xl p-5 shadow-sm">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-3 space-y-3">
        {airports.map((a, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 text-sm border rounded-2xl p-3"
          >
            <div className="flex items-center gap-3">
              <div className="px-2 py-1 rounded-lg bg-neutral-50 border text-xs font-mono">
                {a.code}
              </div>
              <div>
                <div className="font-medium">{a.city}</div>
                <div className="text-xs text-neutral-600">{a.country}</div>
              </div>
            </div>
            <div className="text-xs text-neutral-600 flex items-center gap-3">
              <Pin className="w-4 h-4" />
              {a.drive} · {a.dist}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border rounded-3xl p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl border bg-blue-50 text-blue-700">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-neutral-700 mt-3">{children}</p>
    </motion.div>
  );
}

function PricingCard({
  title,
  price,
  bullets,
  cta,
  highlight,
}: {
  title: string;
  price: string;
  bullets: string[];
  cta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-sm bg-white ${
        highlight ? "ring-2 ring-blue-600" : ""
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-2xl font-bold">{price}</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-neutral-700">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <button className="mt-6 w-full px-4 py-2 rounded-xl border hover:bg-neutral-50 text-sm font-medium">
        {cta}
      </button>
      <p className="text-xs text-neutral-500 mt-2">Cancel anytime</p>
    </div>
  );
}

function FormField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-10 border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 text-sm text-neutral-600 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} TraceFlights by Trace Travel</div>
        <div className="flex gap-6">
          <a href="#" className="hover:underline">
            traceflights.com
          </a>
          <a href="#contact" className="hover:underline">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
