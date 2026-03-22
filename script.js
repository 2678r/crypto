const STORAGE_KEY = "turnip-tracker-week";
const CRYPTO_API_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";
const NEWS_API_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";
const WEATHER_LOCATIONS = [
  {
    id: "istanbul",
    name: "Istanbul",
    timezone: "Europe/Istanbul",
    latitude: 41.0082,
    longitude: 28.9784,
  },
  {
    id: "shanghai",
    name: "Shanghai",
    timezone: "Asia/Shanghai",
    latitude: 31.2304,
    longitude: 121.4737,
  },
  {
    id: "yancheng",
    name: "Yancheng",
    timezone: "Asia/Shanghai",
    latitude: 33.3495,
    longitude: 120.1573,
  },
];

const slots = [
  { id: "mon_am", label: "周一 AM", hint: "上午价格" },
  { id: "mon_pm", label: "周一 PM", hint: "下午价格" },
  { id: "tue_am", label: "周二 AM", hint: "上午价格" },
  { id: "tue_pm", label: "周二 PM", hint: "下午价格" },
  { id: "wed_am", label: "周三 AM", hint: "上午价格" },
  { id: "wed_pm", label: "周三 PM", hint: "下午价格" },
  { id: "thu_am", label: "周四 AM", hint: "上午价格" },
  { id: "thu_pm", label: "周四 PM", hint: "下午价格" },
  { id: "fri_am", label: "周五 AM", hint: "上午价格" },
  { id: "fri_pm", label: "周五 PM", hint: "下午价格" },
  { id: "sat_am", label: "周六 AM", hint: "上午价格" },
  { id: "sat_pm", label: "周六 PM", hint: "下午价格" },
];

const sampleWeek = {
  buyPrice: 96,
  prices: {
    mon_am: 88,
    mon_pm: 83,
    tue_am: 79,
    tue_pm: 74,
    wed_am: 128,
    wed_pm: 176,
    thu_am: 212,
    thu_pm: 164,
    fri_am: 119,
    fri_pm: "",
    sat_am: "",
    sat_pm: "",
  },
};

const defaultState = {
  buyPrice: "",
  prices: Object.fromEntries(slots.map((slot) => [slot.id, ""])),
};

const buyPriceInput = document.querySelector("#buyPriceInput");
const priceGrid = document.querySelector("#priceGrid");
const tableBody = document.querySelector("#tableBody");
const statusText = document.querySelector("#statusText");
const sampleButton = document.querySelector("#sampleButton");
const resetButton = document.querySelector("#resetButton");
const cryptoStatus = document.querySelector("#cryptoStatus");
const newsStatus = document.querySelector("#newsStatus");
const newsList = document.querySelector("#newsList");
const placesStatus = document.querySelector("#placesStatus");
const todayDate = document.querySelector("#todayDate");
const todayTime = document.querySelector("#todayTime");
const todayLunar = document.querySelector("#todayLunar");
const birthdayName = document.querySelector("#birthdayName");
const birthdayMeta = document.querySelector("#birthdayMeta");

const familyBirthdays = [
  { name: "毛毛", birth: "2014-01-05" },
  { name: "鬼鬼", birth: "2018-08-03" },
  { name: "奶奶", birth: "1953-12-10" },
  { name: "爷爷", birth: "1954-06-06" },
  { name: "爸爸", birth: "1981-06-07" },
  { name: "姐姐", birth: "2008-07-08" },
  { name: "帆帆", birth: "2010-01-10" },
  { name: "沈园长", birth: "1987-03-04" },
  { name: "何院长", birth: "1982-10-25" },
];

const fallbackHeadlines = [
  {
    title: "Global markets watch inflation, rates, and fresh risk signals.",
    source: "World",
    link: "https://news.google.com/",
  },
  {
    title: "Major technology and AI developments continue shaping global headlines.",
    source: "Tech",
    link: "https://news.google.com/",
  },
  {
    title: "Energy, shipping, and regional tensions remain key stories worldwide.",
    source: "Economy",
    link: "https://news.google.com/",
  },
  {
    title: "各地市场与政策变化，仍然是全球新闻关注重点。",
    source: "中文",
    link: "https://news.google.com/",
  },
];

const fallbackPlaces = {
  istanbul: [
    { day: "今天", weather: "晴到多云", temp: "18C / 11C" },
    { day: "明天", weather: "局部多云", temp: "17C / 10C" },
    { day: "后天", weather: "小雨", temp: "15C / 9C" },
  ],
  shanghai: [
    { day: "今天", weather: "多云", temp: "22C / 16C" },
    { day: "明天", weather: "阵雨", temp: "21C / 17C" },
    { day: "后天", weather: "阴天", temp: "20C / 15C" },
  ],
  yancheng: [
    { day: "今天", weather: "小雨转阴", temp: "20C / 14C" },
    { day: "明天", weather: "多云", temp: "21C / 13C" },
    { day: "后天", weather: "晴朗", temp: "23C / 14C" },
  ],
};

let state = loadState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(raw);
    return {
      buyPrice: parsed.buyPrice ?? "",
      prices: { ...structuredClone(defaultState).prices, ...(parsed.prices ?? {}) },
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function createInputs() {
  priceGrid.innerHTML = slots
    .map(
      (slot) => `
        <label class="slot-card" for="${slot.id}">
          <span>${slot.label}</span>
          <small>${slot.hint}</small>
          <input
            id="${slot.id}"
            type="number"
            min="0"
            max="999"
            placeholder="未记录"
            value="${state.prices[slot.id]}"
          />
        </label>
      `,
    )
    .join("");

  slots.forEach((slot) => {
    const input = document.querySelector(`#${slot.id}`);
    input.addEventListener("input", (event) => {
      state.prices[slot.id] = event.target.value;
      persistAndRender("已更新本周价格记录。");
    });
  });
}

function getRecordedEntries() {
  return slots
    .map((slot, index) => ({
      ...slot,
      index,
      value: toNumber(state.prices[slot.id]),
    }))
    .filter((slot) => slot.value !== null);
}

function summarizePattern(buyPrice, entries) {
  if (!buyPrice || entries.length === 0) {
    return {
      pattern: "等待录入",
      detail: "先输入买入价和几个时段价格，系统会开始缩小范围。",
      peakRange: "--",
      peakWindow: "还无法判断峰值时段。",
      action: "继续观察",
      actionDetail: "数据越完整，建议会越明确。",
      advice: "先补充价格",
      adviceCopy: "至少录入买入价和 2 到 3 个时段，判断会更稳。",
    };
  }

  const values = entries.map((entry) => entry.value);
  const highest = Math.max(...values);
  const latest = entries[entries.length - 1];
  const aboveBuyCount = values.filter((value) => value > buyPrice).length;
  const bigSpike = values.some((value) => value >= buyPrice * 1.8);
  const risingSteps = values.slice(1).filter((value, index) => value > values[index]).length;
  const fallingSteps = values.slice(1).filter((value, index) => value < values[index]).length;
  const earlyValues = entries.slice(0, 4).map((entry) => entry.value);
  const earlyDrop = earlyValues.length >= 2 && earlyValues.every((value) => value <= buyPrice);

  if (bigSpike) {
    return {
      pattern: "暴涨型候选",
      detail: "已经出现远高于买入价的大峰值，这周更像典型的大波峰走势。",
      peakRange: `${Math.round(highest)} - ${Math.round(highest * 1.12)} 铃钱`,
      peakWindow: latest.index < 7 ? "高点可能已出现，后段要警惕快速回落。" : "高点大概率已经兑现，建议优先落袋为安。",
      action: highest >= buyPrice * 2 ? "高位可卖" : "进入高警戒",
      actionDetail: highest >= buyPrice * 2 ? "已经是非常漂亮的卖点，别等回落。" : "如果下个时段继续冲高，就可以准备出手。",
      advice: "看到 180+ 可重点考虑卖出",
      adviceCopy: "这类走势高点来得快，犹豫太久常常会错过最佳窗口。",
    };
  }

  if (earlyDrop && risingSteps >= 2 && aboveBuyCount >= 1) {
    return {
      pattern: "波动型候选",
      detail: "前半周先压价，后面开始抬升，像中后段冲高的波动走势。",
      peakRange: `${Math.round(buyPrice * 1.45)} - ${Math.round(buyPrice * 1.9)} 铃钱`,
      peakWindow: latest.index <= 6 ? "重点盯周三 PM 到周五 AM，容易出现好价格。" : "如果目前还在抬升，接下来 1 到 2 个时段值得守一下。",
      action: aboveBuyCount >= 2 ? "可分批卖" : "继续盯高点",
      actionDetail: aboveBuyCount >= 2 ? "已经进入盈利区，可以分批卖出降低回落风险。" : "还在酝酿阶段，先别太早出清。",
      advice: "重点关注中后段抬升",
      adviceCopy: "这种走势最怕错过真正峰值，建议每个 AM/PM 都及时补录。",
    };
  }

  if (fallingSteps >= Math.max(3, entries.length - 2) && highest <= buyPrice * 1.1) {
    return {
      pattern: "递减型候选",
      detail: "整体持续走低，暂时看不到强反弹，像一周慢慢烂掉的走势。",
      peakRange: `${Math.round(buyPrice * 0.65)} - ${Math.round(buyPrice * 1.05)} 铃钱`,
      peakWindow: "后续通常不会很惊艳，若出现接近买入价的反弹就值得重视。",
      action: latest.value >= buyPrice ? "保本可卖" : "尽量减少损失",
      actionDetail: latest.value >= buyPrice ? "能回到买入价附近已经不错，可以考虑直接卖。" : "如果你有别的岛可以串门，最好尽快找更好价格。",
      advice: "别把希望押得太满",
      adviceCopy: "递减周最重要的是止损和保本，不要等不存在的大反转。",
    };
  }

  return {
    pattern: "小波型候选",
    detail: "目前像温和起伏的一周，可能会有一次中等强度上涨，但未必特别夸张。",
    peakRange: `${Math.round(buyPrice * 1.15)} - ${Math.round(buyPrice * 1.45)} 铃钱`,
    peakWindow: latest.index <= 8 ? "高点更可能落在周四到周五之间。" : "剩余时段不多，有利润就可以更主动一点。",
    action: highest > buyPrice * 1.25 ? "有赚可卖" : "观察下一跳",
    actionDetail: highest > buyPrice * 1.25 ? "这类走势峰值通常不算夸张，达到心理价位就可以卖。" : "还没出现明显卖点，再观察一两个时段。",
    advice: "别等超大奇迹价",
    adviceCopy: "小波型更适合见好就收，不一定会给到 200+ 的梦幻数字。",
  };
}

function formatBell(value) {
  return value === null ? "-- 铃钱" : `${value} 铃钱`;
}

function getDeltaClass(delta) {
  if (delta > 0) return "price-up";
  if (delta < 0) return "price-down";
  return "price-flat";
}

function getStatusPill(price, buyPrice) {
  if (price === null) {
    return { label: "未记录", className: "pill-caution" };
  }

  if (price >= buyPrice * 1.5) {
    return { label: "好价格", className: "pill-good" };
  }

  if (price >= buyPrice) {
    return { label: "已回本", className: "pill-caution" };
  }

  return { label: "低于成本", className: "pill-bad" };
}

function renderTable(buyPrice) {
  tableBody.innerHTML = slots
    .map((slot) => {
      const value = toNumber(state.prices[slot.id]);
      const delta = buyPrice && value !== null ? value - buyPrice : null;
      const deltaText =
        delta === null ? "--" : `${delta > 0 ? "+" : ""}${delta} 铃钱`;
      const pill = getStatusPill(value, buyPrice || Number.MAX_SAFE_INTEGER);

      return `
        <tr>
          <td data-label="时段">${slot.label}</td>
          <td data-label="价格">${value === null ? "--" : `${value} 铃钱`}</td>
          <td data-label="相对买入价" class="${delta === null ? "" : getDeltaClass(delta)}">${deltaText}</td>
          <td data-label="状态"><span class="status-pill ${pill.className}">${pill.label}</span></td>
        </tr>
      `;
    })
    .join("");
}

function render() {
  const buyPrice = toNumber(state.buyPrice);
  const entries = getRecordedEntries();
  const summary = summarizePattern(buyPrice, entries);
  const highest = entries.length ? Math.max(...entries.map((entry) => entry.value)) : null;

  buyPriceInput.value = state.buyPrice;

  document.querySelector("#patternName").textContent = summary.pattern;
  document.querySelector("#patternDetail").textContent = summary.detail;
  document.querySelector("#buyPriceCard").textContent = formatBell(buyPrice);
  document.querySelector("#weekHighCard").textContent = formatBell(highest);
  document.querySelector("#actionCard").textContent = summary.action;
  document.querySelector("#actionDetail").textContent = summary.actionDetail;

  document.querySelector("#bestPattern").textContent = summary.pattern;
  document.querySelector("#bestPatternCopy").textContent = summary.detail;
  document.querySelector("#peakRange").textContent = summary.peakRange;
  document.querySelector("#peakWindow").textContent = summary.peakWindow;
  document.querySelector("#nextAdvice").textContent = summary.advice;
  document.querySelector("#nextAdviceCopy").textContent = summary.adviceCopy;

  renderTable(buyPrice);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSourceLabel(item) {
  if (item.source) return item.source;
  if (item.author) return item.author;
  return "Headline";
}

function renderNews(items) {
  newsList.innerHTML = items
    .slice(0, 4)
    .map((item) => {
      const title = escapeHtml(item.title ?? "Untitled headline");
      const source = escapeHtml(getSourceLabel(item));
      const link = item.link || "https://news.google.com/";

      return `
        <a class="news-item" href="${link}" target="_blank" rel="noreferrer">
          <p class="news-source">${source}</p>
          <p class="news-title">${title}</p>
        </a>
      `;
    })
    .join("");
}

function formatCityTime(timezone) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(new Date());
}

function formatTodayLunar(date) {
  try {
    const lunarParts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).formatToParts(date);

    const year = lunarParts.find((part) => part.type === "relatedYear")?.value || "";
    const month = lunarParts.find((part) => part.type === "month")?.value || "";
    const day = lunarParts.find((part) => part.type === "day")?.value || "";

    return `农历 ${year}年 ${month}${day}`;
  } catch {
    return "农历信息暂不可用";
  }
}

function getLunarMonthDay(date) {
  const parts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    month: "long",
    day: "numeric",
  }).formatToParts(date);

  return {
    month: parts.find((part) => part.type === "month")?.value || "",
    day: parts.find((part) => part.type === "day")?.value || "",
  };
}

function parseBirthDate(value) {
  const digits = value.replaceAll("-", "");
  if (digits.length !== 8) return null;

  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function diffDays(from, to) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end - start) / 86400000);
}

function findNextLunarBirthday(targetMonth, targetDay, fromDate) {
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());

  for (let offset = 0; offset <= 400; offset += 1) {
    const probe = new Date(start);
    probe.setDate(start.getDate() + offset);
    const lunar = getLunarMonthDay(probe);

    if (lunar.month === targetMonth && lunar.day === targetDay) {
      return probe;
    }
  }

  return null;
}

function updateBirthdayReminder() {
  if (!birthdayName || !birthdayMeta) return;

  const today = new Date();
  const candidates = familyBirthdays
    .map((person) => {
      const birthDate = parseBirthDate(person.birth);
      if (!birthDate) return null;

      const lunarBirth = getLunarMonthDay(birthDate);
      const nextBirthday = findNextLunarBirthday(lunarBirth.month, lunarBirth.day, today);
      if (!nextBirthday) return null;

      return {
        ...person,
        lunarLabel: `${lunarBirth.month}${lunarBirth.day}`,
        nextBirthday,
        daysLeft: diffDays(today, nextBirthday),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.daysLeft - right.daysLeft);

  const upcoming = candidates[0];

  if (!upcoming) {
    birthdayName.textContent = "暂时算不出来";
    birthdayMeta.textContent = "生日提醒加载失败。";
    return;
  }

  birthdayName.textContent = `${upcoming.name} 快过生日啦`;

  if (upcoming.daysLeft === 0) {
    birthdayMeta.textContent = `今天是农历${upcoming.lunarLabel}，正好生日。`;
    return;
  }

  birthdayMeta.textContent =
    `农历${upcoming.lunarLabel}，还有 ${upcoming.daysLeft} 天。`;
}

function updateTodayInfo() {
  const now = new Date();

  if (todayDate) {
    todayDate.textContent = new Intl.DateTimeFormat("zh-CN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(now);
  }

  if (todayTime) {
    todayTime.textContent = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
  }

  if (todayLunar) {
    todayLunar.textContent = formatTodayLunar(now);
  }
}

function weatherCodeToText(code) {
  const map = {
    0: "晴朗",
    1: "大致晴",
    2: "局部多云",
    3: "阴天",
    45: "有雾",
    48: "雾凇",
    51: "小毛雨",
    53: "毛雨",
    55: "强毛雨",
    61: "小雨",
    63: "中雨",
    65: "大雨",
    71: "小雪",
    73: "中雪",
    75: "大雪",
    80: "阵雨",
    81: "较强阵雨",
    82: "强阵雨",
    95: "雷暴",
  };

  return map[code] || "天气更新中";
}

function updatePlaceTime() {
  WEATHER_LOCATIONS.forEach((location) => {
    const timeNode = document.querySelector(`#${location.id}Time`);
    if (timeNode) {
      timeNode.textContent = formatCityTime(location.timezone);
    }
  });
}

function renderPlaceForecast(id, days) {
  const forecastNode = document.querySelector(`#${id}Forecast`);
  if (!forecastNode) return;

  forecastNode.innerHTML = days
    .slice(0, 3)
    .map(
      (day) => `
        <div class="forecast-day">
          <span class="forecast-day-name">${escapeHtml(day.day)}</span>
          <span class="forecast-day-weather">${escapeHtml(day.weather)}</span>
          <span class="forecast-day-temp">${escapeHtml(day.temp)}</span>
        </div>
      `,
    )
    .join("");
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

  priceNode.textContent = formatUsd(price);
  changeNode.textContent = formatPercent(change);
  changeNode.className = "crypto-badge";

  if (change > 0.15) {
    changeNode.classList.add("crypto-up");
  } else if (change < -0.15) {
    changeNode.classList.add("crypto-down");
  } else {
    changeNode.classList.add("crypto-flat");
  }
}

function renderFortuneBtc(price) {
  const fortuneNode = document.querySelector("#fortuneBtcPrice");
  if (!fortuneNode) return;

  if (typeof price !== "number" || Number.isNaN(price)) {
    fortuneNode.textContent = "--";
    return;
  }

  if (price >= 10_000) {
    fortuneNode.textContent = `$${Math.round(price / 1000)}k`;
    return;
  }

  fortuneNode.textContent = formatUsd(price);
}

async function loadCryptoPrices() {
  cryptoStatus.textContent = "正在获取实时价格...";

  try {
    const response = await fetch(CRYPTO_API_URL, {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    renderCryptoCard(
      "#btcPrice",
      "#btcChange",
      data.bitcoin?.usd,
      data.bitcoin?.usd_24h_change,
    );
    renderCryptoCard(
      "#ethPrice",
      "#ethChange",
      data.ethereum?.usd,
      data.ethereum?.usd_24h_change,
    );
    renderFortuneBtc(data.bitcoin?.usd);
    cryptoStatus.textContent = "实时价格来自 CoinGecko，会在每分钟刷新一次。";
  } catch (error) {
    document.querySelector("#btcPrice").textContent = "--";
    document.querySelector("#ethPrice").textContent = "--";
    document.querySelector("#btcChange").textContent = "暂不可用";
    document.querySelector("#ethChange").textContent = "暂不可用";
    renderFortuneBtc(null);
    document.querySelector("#btcChange").className = "crypto-badge crypto-flat";
    document.querySelector("#ethChange").className = "crypto-badge crypto-flat";
    cryptoStatus.textContent = "暂时拿不到实时价格，稍后再试。";
    console.error(error);
  }
}

async function loadNewsHeadlines() {
  if (!newsStatus || !newsList) return;

  newsStatus.textContent = "正在获取头条新闻...";

  try {
    const response = await fetch(NEWS_API_URL, {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];

    if (!items.length) {
      throw new Error("No items");
    }

    renderNews(
      items.map((item) => ({
        title: item.title,
        source: item.author || item.source || "Google News",
        link: item.link,
      })),
    );
    newsStatus.textContent = "显示 4 条世界头条，支持中英文标题。";
  } catch (error) {
    renderNews(fallbackHeadlines);
    newsStatus.textContent = "实时头条暂时不可用，先显示备用新闻提示。";
    console.error(error);
  }
}

async function loadPlacesWeather() {
  if (!placesStatus) return;

  placesStatus.textContent = "正在获取天气与本地时间...";
  updatePlaceTime();

  try {
    await Promise.all(
      WEATHER_LOCATIONS.map(async (location) => {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}` +
          `&longitude=${location.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=3&timezone=auto`;
        const response = await fetch(url, {
          headers: { accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const daily = data.daily;
        const labels = ["今天", "明天", "后天"];
        const forecast = labels.map((label, index) => ({
          day: label,
          weather: weatherCodeToText(daily?.weather_code?.[index]),
          temp: `${Math.round(daily?.temperature_2m_max?.[index] ?? 0)}C / ${Math.round(daily?.temperature_2m_min?.[index] ?? 0)}C`,
        }));

        renderPlaceForecast(location.id, forecast);
      }),
    );

    placesStatus.textContent = "三地时间实时更新，天气显示最近 3 天预报。";
  } catch (error) {
    WEATHER_LOCATIONS.forEach((location) => {
      const fallback = fallbackPlaces[location.id];
      renderPlaceForecast(location.id, fallback);
    });
    placesStatus.textContent = "实时天气暂时不可用，先显示备用信息。";
    console.error(error);
  }
}

function persistAndRender(message) {
  saveState();
  render();
  if (statusText) {
    statusText.textContent = message;
  }
}

buyPriceInput.addEventListener("input", (event) => {
  state.buyPrice = event.target.value;
  persistAndRender("已更新周日买入价。");
});

if (sampleButton) {
  sampleButton.addEventListener("click", () => {
    state = structuredClone(sampleWeek);
    createInputs();
    persistAndRender("已填入一组示例数据，方便你先看页面效果。");
  });
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    state = structuredClone(defaultState);
    createInputs();
    persistAndRender("本周记录已清空。");
  });
}

createInputs();
render();
updateTodayInfo();
updateBirthdayReminder();
updatePlaceTime();
loadCryptoPrices();
loadNewsHeadlines();
loadPlacesWeather();
window.setInterval(updateTodayInfo, 1000);
window.setInterval(updateBirthdayReminder, 60 * 60_000);
window.setInterval(updatePlaceTime, 30_000);
window.setInterval(loadCryptoPrices, 60_000);
window.setInterval(loadNewsHeadlines, 10 * 60_000);
window.setInterval(loadPlacesWeather, 10 * 60_000);
