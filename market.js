const CRYPTO_API_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";

const NEWS_FEEDS = [
  {
    source: "Reuters",
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.reuters.com/Reuters/worldNews",
  },
  {
    source: "BBC",
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/world/rss.xml",
  },
];

const foodBenchmarks = [
  { name: "牛肉", benchmark: "全球基准", unit: "$/kg", latest: 8.12, previous: 7.97, period: "2026年2月" },
  { name: "鸡肉", benchmark: "全球基准", unit: "$/kg", latest: 1.79, previous: 1.75, period: "2026年2月" },
  { name: "大米", benchmark: "泰国 5% 碎米", unit: "$/mt", latest: 409.0, previous: 408.0, period: "2026年2月" },
  { name: "小麦", benchmark: "美国 HRW", unit: "$/mt", latest: 257.6, previous: 249.9, period: "2026年2月" },
  { name: "食用油", benchmark: "棕榈油", unit: "$/mt", latest: 1042, previous: 1005, period: "2026年2月" },
  { name: "糖", benchmark: "世界糖价", unit: "$/kg", latest: 0.31, previous: 0.32, period: "2026年2月" },
];

const fallbackHeadlines = [
  {
    title: "Global markets watch inflation, rates, and fresh risk signals.",
    source: "Reuters",
    link: "https://www.reuters.com/world/",
  },
  {
    title: "Major technology and AI developments continue shaping global headlines.",
    source: "BBC",
    link: "https://www.bbc.com/news/world",
  },
  {
    title: "Energy, shipping, and regional tensions remain key stories worldwide.",
    source: "Reuters",
    link: "https://www.reuters.com/world/",
  },
  {
    title: "各地市场、能源与航运变化，仍然是全球关注重点。",
    source: "BBC",
    link: "https://www.bbc.com/news/world",
  },
];

const cryptoStatus = document.querySelector("#cryptoStatus");
const newsStatus = document.querySelector("#newsStatus");
const newsList = document.querySelector("#newsList");
const foodStatus = document.querySelector("#foodStatus");
const foodGrid = document.querySelector("#foodGrid");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatUsd(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatPercent(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

function renderCryptoCard(priceId, changeId, price, change) {
  const priceNode = document.querySelector(priceId);
  const changeNode = document.querySelector(changeId);
  if (!priceNode || !changeNode) return;

  priceNode.textContent = formatUsd(price);
  changeNode.textContent = formatPercent(change);
  changeNode.className = "delta";

  if (change > 0.15) {
    changeNode.classList.add("up");
  } else if (change < -0.15) {
    changeNode.classList.add("down");
  } else {
    changeNode.classList.add("flat");
  }
}

async function loadCryptoPrices() {
  cryptoStatus.textContent = "正在获取实时价格...";

  try {
    const response = await fetch(CRYPTO_API_URL);
    if (!response.ok) throw new Error("crypto-fetch-failed");

    const data = await response.json();
    const btc = data.bitcoin || {};
    const eth = data.ethereum || {};

    renderCryptoCard("#btcPrice", "#btcChange", btc.usd, btc.usd_24h_change);
    renderCryptoCard("#ethPrice", "#ethChange", eth.usd, eth.usd_24h_change);
    cryptoStatus.textContent = "CoinGecko 实时美元价格。";
  } catch {
    cryptoStatus.textContent = "实时价格暂时不可用。";
    renderCryptoCard("#btcPrice", "#btcChange", NaN, NaN);
    renderCryptoCard("#ethPrice", "#ethChange", NaN, NaN);
  }
}

function renderNews(items) {
  newsList.innerHTML = items
    .slice(0, 4)
    .map((item) => {
      const title = escapeHtml(item.title || "Untitled headline");
      const source = escapeHtml(item.source || item.author || "Headline");
      const link = item.link || "https://www.reuters.com/world/";
      return `
        <a class="headline-card" href="${link}" target="_blank" rel="noreferrer">
          <p class="headline-source">${source}</p>
          <p class="headline-title">${title}</p>
        </a>
      `;
    })
    .join("");
}

async function loadNewsHeadlines() {
  newsStatus.textContent = "正在获取世界新闻...";

  try {
    const feeds = await Promise.all(
      NEWS_FEEDS.map(async (feed) => {
        const response = await fetch(feed.url);
        if (!response.ok) throw new Error("news-feed-failed");
        const data = await response.json();
        return (data.items || []).slice(0, 2).map((item) => ({
          title: item.title,
          link: item.link,
          source: feed.source,
        }));
      }),
    );

    renderNews(feeds.flat());
    newsStatus.textContent = "Reuters + BBC 世界头条。";
  } catch {
    renderNews(fallbackHeadlines);
    newsStatus.textContent = "已切换到备用头条。";
  }
}

function formatFoodValue(value, unit) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)} ${unit.replace("$", "").trim()}`;
}

function formatFoodDelta(latest, previous) {
  if (typeof latest !== "number" || typeof previous !== "number" || previous === 0) {
    return { label: "--", className: "food-change food-flat" };
  }

  const change = ((latest - previous) / previous) * 100;
  const prefix = change > 0 ? "+" : "";
  const className =
    change > 0.05 ? "food-change food-up" : change < -0.05 ? "food-change food-down" : "food-change food-flat";
  return { label: `${prefix}${change.toFixed(1)}%`, className };
}

function renderFoodBoard() {
  foodStatus.textContent = "来源：世界银行 Pink Sheet，统一按美元基准价显示。";
  foodGrid.innerHTML = foodBenchmarks
    .map((item) => {
      const delta = formatFoodDelta(item.latest, item.previous);
      return `
        <article class="food-card">
          <div class="food-card-top">
            <div>
              <p class="food-name">${escapeHtml(item.name)}</p>
              <p class="food-benchmark">${escapeHtml(item.benchmark)}</p>
            </div>
            <span class="${delta.className}">${delta.label}</span>
          </div>
          <h3>${escapeHtml(formatFoodValue(item.latest, item.unit))}</h3>
          <p class="food-period">${escapeHtml(item.period)} 月均价</p>
        </article>
      `;
    })
    .join("");
}

function updateClock(id, timezone) {
  const node = document.querySelector(id);
  if (!node) return;
  node.textContent = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(new Date());
}

function updateClocks() {
  updateClock("#clockShanghai", "Asia/Shanghai");
  updateClock("#clockIstanbul", "Europe/Istanbul");
  updateClock("#clockLondon", "Europe/London");
  updateClock("#clockNewYork", "America/New_York");
}

renderFoodBoard();
updateClocks();
loadCryptoPrices();
loadNewsHeadlines();

window.setInterval(updateClocks, 1000);
window.setInterval(loadCryptoPrices, 60_000);
window.setInterval(loadNewsHeadlines, 10 * 60_000);
