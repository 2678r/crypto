const CRYPTO_API_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";
const CRYPTO_FALLBACK_SPOT_URLS = {
  bitcoin: "https://api.coinbase.com/v2/prices/BTC-USD/spot",
  ethereum: "https://api.coinbase.com/v2/prices/ETH-USD/spot",
};
const CRYPTO_CACHE_KEY = "market-crypto-cache-v1";
const CRYPTO_CACHE_MAX_AGE_MS = 12 * 60 * 60_000;
const FETCH_TIMEOUT_MS = 8_000;

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

const economicData = {
  turkey: {
    gdp: "1.15 万亿美元",
    growth: "3.5%",
    population: "8600 万",
    perCapita: "13,372 美元",
  },
  china: {
    gdp: "17.9 万亿美元",
    growth: "5.2%",
    population: "14.2 亿",
    perCapita: "12,556 美元",
  },
};

const cryptoStatus = document.querySelector("#cryptoStatus");
const newsStatus = document.querySelector("#newsStatus");
const newsList = document.querySelector("#newsList");
const foodStatus = document.querySelector("#foodStatus");
const foodGrid = document.querySelector("#foodGrid");
const economyStatus = document.querySelector("#economyStatus");

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

function formatPercent(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

async function fetchJsonWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    window.clearTimeout(timer);
  }
}

function loadJsonCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveJsonCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore cache write issues and keep the page working.
  }
}

function normalizeCryptoPayload(payload) {
  const btcUsd = Number(payload?.bitcoin?.usd);
  const ethUsd = Number(payload?.ethereum?.usd);
  const btcChange = Number(payload?.bitcoin?.usd_24h_change);
  const ethChange = Number(payload?.ethereum?.usd_24h_change);

  if (!Number.isFinite(btcUsd) || !Number.isFinite(ethUsd)) {
    return null;
  }

  return {
    bitcoin: {
      usd: btcUsd,
      usd_24h_change: Number.isFinite(btcChange) ? btcChange : null,
    },
    ethereum: {
      usd: ethUsd,
      usd_24h_change: Number.isFinite(ethChange) ? ethChange : null,
    },
  };
}

function loadCryptoCache() {
  const cached = loadJsonCache(CRYPTO_CACHE_KEY);
  if (!cached || !cached.savedAt) return null;

  const age = Date.now() - Number(cached.savedAt);
  if (!Number.isFinite(age) || age < 0 || age > CRYPTO_CACHE_MAX_AGE_MS) {
    return null;
  }

  return normalizeCryptoPayload(cached.payload);
}

function saveCryptoCache(payload) {
  saveJsonCache(CRYPTO_CACHE_KEY, {
    savedAt: Date.now(),
    payload,
  });
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

function applyCryptoPayload(payload) {
  const normalized = normalizeCryptoPayload(payload);
  if (!normalized) return false;

  renderCryptoCard("#btcPrice", "#btcChange", normalized.bitcoin.usd, normalized.bitcoin.usd_24h_change);
  renderCryptoCard("#ethPrice", "#ethChange", normalized.ethereum.usd, normalized.ethereum.usd_24h_change);
  saveCryptoCache(normalized);
  return true;
}

async function fetchCoinGeckoCryptoPayload() {
  const response = await fetchJsonWithTimeout(CRYPTO_API_URL);
  if (!response.ok) throw new Error("crypto-fetch-failed");
  return normalizeCryptoPayload(await response.json());
}

async function fetchFallbackCryptoPayload(previousPayload = null) {
  const [btcResponse, ethResponse] = await Promise.all([
    fetchJsonWithTimeout(CRYPTO_FALLBACK_SPOT_URLS.bitcoin),
    fetchJsonWithTimeout(CRYPTO_FALLBACK_SPOT_URLS.ethereum),
  ]);

  if (!btcResponse.ok || !ethResponse.ok) throw new Error("crypto-fallback-failed");

  const btcJson = await btcResponse.json();
  const ethJson = await ethResponse.json();
  const btcUsd = Number(btcJson?.data?.amount);
  const ethUsd = Number(ethJson?.data?.amount);

  if (!Number.isFinite(btcUsd) || !Number.isFinite(ethUsd)) {
    throw new Error("crypto-fallback-invalid");
  }

  return {
    bitcoin: {
      usd: btcUsd,
      usd_24h_change: Number(previousPayload?.bitcoin?.usd_24h_change),
    },
    ethereum: {
      usd: ethUsd,
      usd_24h_change: Number(previousPayload?.ethereum?.usd_24h_change),
    },
  };
}

async function loadCryptoPrices() {
  cryptoStatus.textContent = "正在获取实时价格...";

  try {
    const payload = await fetchCoinGeckoCryptoPayload();
    applyCryptoPayload(payload);
    cryptoStatus.textContent = "CoinGecko 实时美元价格。";
  } catch {
    try {
      const fallbackPayload = await fetchFallbackCryptoPayload(loadCryptoCache());
      applyCryptoPayload(fallbackPayload);
      cryptoStatus.textContent = "CoinGecko 暂时不可用，已切换到 Coinbase 现货价格。";
      return;
    } catch {
      const cachedPayload = loadCryptoCache();
      if (cachedPayload && applyCryptoPayload(cachedPayload)) {
        cryptoStatus.textContent = "实时接口暂时不稳定，先显示最近一次成功缓存的价格。";
        return;
      }
    }

    cryptoStatus.textContent = "多个实时源都没拿到数据，稍后会自动重试。";
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
  foodStatus.textContent = "来源：世界银行 Pink Sheet，显示的是国际月均基准价，不是各地实时零售价。";
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
          <p class="food-period">${escapeHtml(item.period)} 国际月均价</p>
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

function loadEconomyData() {
  document.querySelector("#turkeyGdp").textContent = economicData.turkey.gdp;
  document.querySelector("#turkeyGrowth").textContent = economicData.turkey.growth;
  document.querySelector("#turkeyPopulation").textContent = economicData.turkey.population;
  document.querySelector("#turkeyPerCapita").textContent = economicData.turkey.perCapita;
  
  document.querySelector("#chinaGdp").textContent = economicData.china.gdp;
  document.querySelector("#chinaGrowth").textContent = economicData.china.growth;
  document.querySelector("#chinaPopulation").textContent = economicData.china.population;
  document.querySelector("#chinaPerCapita").textContent = economicData.china.perCapita;
}

renderFoodBoard();
updateClocks();
loadEconomyData();
loadCryptoPrices();
loadNewsHeadlines();

window.setInterval(updateClocks, 1000);
window.setInterval(loadCryptoPrices, 60_000);
window.setInterval(loadNewsHeadlines, 10 * 60_000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    loadCryptoPrices();
  }
});
