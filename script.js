const STORAGE_KEY = "turnip-tracker-week";
const MESSAGE_BOARD_KEY = "family-message-board-v1";
const SUPABASE_URL = "https://cxwwvqafpmnwebrldjcd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_jyQ8EuXV2kRTcRKtauUpIw_0zQEDz2y";
const SUPABASE_MESSAGE_TABLE = "family_messages";
const MESSAGE_REFRESH_MS = 30000;
const BIRTHDAY_CACHE_KEY = "family-lunar-birthday-cache-v2";
const BIRTHDAY_TODAY_CACHE_KEY = "family-lunar-upcoming-cache-v3";
const BIRTHDAY_PREVIEW_MODE = false;
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
const blessingList = document.querySelector("#blessingList");
const todayDate = document.querySelector("#todayDate");
const turkeyTime = document.querySelector("#turkeyTime");
const chinaTime = document.querySelector("#chinaTime");
const todayLunar = document.querySelector("#todayLunar");
const birthdayName = document.querySelector("#birthdayName");
const birthdayMeta = document.querySelector("#birthdayMeta");
const dailyQuote = document.querySelector("#dailyQuote");
const mainHeadline = document.querySelector("#mainHeadline");
const birthdayHeroBanner = document.querySelector("#birthdayHeroBanner");
const birthdayHeroText = document.querySelector("#birthdayHeroText");
const heroCopy = document.querySelector(".hero-copy");
const blessingWall = document.querySelector("#blessingWall");
const familyExtra = document.querySelector("#familyExtra");
const foodExtra = document.querySelector("#foodExtra");
const turnipExtra = document.querySelector("#turnipExtra");
const messageForm = document.querySelector("#messageForm");
const messageNameInput = document.querySelector("#messageName");
const messageTextInput = document.querySelector("#messageText");
const messageStatus = document.querySelector("#messageStatus");
const messageList = document.querySelector("#messageList");
const foodStatus = document.querySelector("#foodStatus");
const foodGrid = document.querySelector("#foodGrid");
let messageBoardMode = "shared";

const foodBenchmarks = [
  { name: "牛肉", benchmark: "全球基准", unit: "$/kg", latest: 8.12, previous: 7.97, period: "2026年2月" },
  { name: "鸡肉", benchmark: "全球基准", unit: "$/kg", latest: 1.79, previous: 1.75, period: "2026年2月" },
  { name: "大米", benchmark: "泰国 5% 碎米", unit: "$/mt", latest: 409.0, previous: 408.0, period: "2026年2月" },
  { name: "小麦", benchmark: "美国 HRW", unit: "$/mt", latest: 257.6, previous: 249.9, period: "2026年2月" },
  { name: "食用油", benchmark: "棕榈油", unit: "$/mt", latest: 1042, previous: 1005, period: "2026年2月" },
  { name: "糖", benchmark: "世界糖价", unit: "$/kg", latest: 0.31, previous: 0.32, period: "2026年2月" },
];

const familyBirthdays = [
  { name: "毛毛", birth: "2014-01-05" },
  { name: "鬼鬼", birth: "2018-08-03" },
  { name: "奶奶", birth: "1953-12-10" },
  { name: "爷爷", birth: "1954-06-06", lunarOverride: { month: "五月", day: "16" } },
  { name: "爸爸", birth: "1981-06-07" },
  { name: "姐姐", birth: "2008-07-08" },
  { name: "帆帆", birth: "2010-01-10" },
  { name: "沈园长", birth: "1987-03-04" },
  { name: "何院长", birth: "1982-10-25" },
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
    title: "各地市场与政策变化，仍然是全球新闻关注重点。",
    source: "BBC",
    link: "https://www.bbc.com/news/world",
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

const dailyQuotes = [
  "今天慢一点，也没有关系。",
  "家人安好，就是最好的财富。",
  "小小努力，也会慢慢开花。",
  "平安顺遂，本身就是好日子。",
  "把今天过好，明天自然会来。",
  "心里有光，日子就会亮一点。",
  "慢慢来，生活自有答案。",
  "愿今天的你，也被温柔对待。",
  "好运常来，烦恼慢慢走开。",
  "一家人平平安安，就是最大的福气。",
  "好心情，会带来好消息。",
  "认真生活的人，运气都不会太差。",
];

const blessingKeywords = [
  "福寿绵长",
  "岁岁平安",
  "红光满面",
  "容光焕发",
  "笑口常开",
  "心情明朗",
  "长命百岁",
  "耳聪目明",
  "家和美满",
  "和和美美",
  "亲亲热热",
  "团团圆圆",
  "团圆",
  "顺顺利利",
  "喜喜庆庆",
  "日日平安",
  "福星高照",
  "吉星高照",
  "福禄寿喜",
  "热气腾腾",
  "神清气爽",
  "精神抖擞",
  "气色越来越好",
  "越活越年轻",
  "越看越漂亮",
  "容颜常美",
  "温柔",
  "可爱",
  "漂亮",
  "健康",
  "快乐",
  "幸福",
  "长寿",
  "美丽",
  "平安",
  "好运",
  "福气",
  "安康",
  "吉祥",
  "喜气",
  "平安顺遂",
  "顺心",
  "顺利",
  "旺",
  "有福",
  "福寿",
  "福气满满",
  "年轻",
  "明朗",
  "甜",
  "开怀",
  "厚待",
  "舒服",
  "热爱",
  "热望",
  "美",
  "亮",
  "暖",
  "好看",
];

const blessingMessages = [
  "愿你身体硬朗像小太阳，一年四季都精神饱满，元气满满。",
  "愿你天天红光满面，气色越来越好，走到哪里都自带福气。",
  "愿你健康常在，平安常在，快乐常在，好运常在。",
  "愿你福气冲天，喜气连连，运气旺到像开了金光外挂。",
  "愿你越活越年轻，越看越漂亮，越笑越有福相。",
  "愿你每天醒来都神清气爽，吃得香睡得甜，百病不沾。",
  "愿你一年比一年顺，一岁比一岁旺，日日都是好时辰。",
  "愿你笑口常开，眉眼带喜，所有烦恼都自动绕道走开。",
  "愿你身体棒棒，心情亮亮，日子甜甜，福气长长。",
  "愿你今天平安，明天平安，天天平安，岁岁平安。",
  "愿你容光焕发，精神抖擞，气质美得像一路开花。",
  "愿你长命百岁，耳聪目明，腿脚有劲，日子越过越有神。",
  "愿你家中常有欢笑，桌上常有热饭，心里常有温暖。",
  "愿你全家和和美美，亲亲热热，天天都有团圆的喜气。",
  "愿你家门口进的是好消息，窗户外吹的是好运风。",
  "愿你家里福星高照，喜鹊常来，财神常住，幸福常满。",
  "愿你出门见喜，回家见福，抬头见顺，低头见财。",
  "愿你越活越舒展，越过越松弛，心宽福自来。",
  "愿你皮肤亮亮，眼睛有光，笑起来像春天一样好看。",
  "愿你饭吃得香，觉睡得沉，梦做得甜，运走得顺。",
  "愿你今天被好运抱个满怀，明天被福气围个满圈。",
  "愿你要风得风，要喜得喜，要顺得顺，要福得福。",
  "愿你身边的人都温柔，眼前的事都顺手，未来的路都宽阔。",
  "愿你健康这件事稳稳当当，幸福这件事长长久久。",
  "愿你一年到头没有大烦恼，小日子一天天越过越旺。",
  "愿你心里有底气，脸上有喜气，生活里全是好彩气。",
  "愿你家人安康，彼此惦记，互相关心，日子热气腾腾。",
  "愿你每天都有被宠爱的感觉，也有被祝福包围的运气。",
  "愿你漂亮得发光，温柔得发亮，幸福得发热。",
  "愿你身体像老松一样稳，福气像江海一样长。",
  "愿你从早到晚都顺顺利利，从年头到年尾都喜喜庆庆。",
  "愿你走路带风，做事有成，开口有喜，闭眼有安。",
  "愿你每个愿望都不落空，每份期待都有好回音。",
  "愿你家里灯火温暖，饭菜飘香，日子过得有滋有味。",
  "愿你越老越有福，越老越有气场，越老越被疼爱。",
  "愿你福寿绵长，笑容常在，岁月都舍不得催你老。",
  "愿你心情像晴天一样明朗，身体像青松一样结实。",
  "愿你想见的人常见，想过的日子都能过成。",
  "愿你小病不来，大病远去，身体稳得像福山。",
  "愿你气运长虹，吉星高照，人生一路开满吉祥花。",
  "愿你美丽不止外表，心也柔软，命也明亮。",
  "愿你福禄寿喜样样不缺，平安顺心件件都来。",
  "愿你家里老人硬朗，孩子开心，大人顺心，处处是福。",
  "愿你有热饭热汤，也有热爱热望，天天好心情。",
  "愿你今天笑得最甜，明天福气更甜，后天好运冲天。",
  "愿你天冷有暖气，天热有清风，四季都有舒服日子。",
  "愿你有被生活厚待的运气，也有把日子过好的本事。",
  "愿你日子不慌不忙，身体不疼不痒，心里不忧不惧。",
  "愿你眼里有光，脚下有路，身后有家，前方有福。",
  "愿你家里一团和气，出门一路喜气，回家满屋福气。",
  "愿你身体越来越轻快，心情越来越开阔，福气越来越厚。",
  "愿你既被岁月善待，也被家人宠爱，还被好运偏爱。",
  "愿你笑一笑喜上眉梢，走一走好运开道，坐一坐福星来到。",
  "愿你今后每一年都比上一年更平安、更美、更旺。",
  "愿你福气装满口袋，快乐装满心房，幸福装满日常。",
  "愿你身体里的每一个细胞都在说：今天状态真好。",
  "愿你家和万事兴，门开千般喜，窗进万道福。",
  "愿你从春到冬都有好消息，从早到晚都有好心情。",
  "愿你被健康守护，被好运偏心，被幸福长期录用。",
  "愿你一生少风雨，多晴朗；少焦虑，多欢喜。",
  "愿你全家福气翻倍，健康翻倍，温暖翻倍，幸福翻倍。",
  "愿你人逢喜事精神爽，家有吉庆万事昌。",
  "愿你今天被爱包围，明天被福围绕，后天被好运追着跑。",
  "愿你活得漂亮，睡得安稳，笑得开怀，福得实在。",
  "愿你福如东海滚滚来，寿比南山稳稳在，家和万事样样开。",
];

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

function loadMessageEntries() {
  const raw = loadJsonCache(MESSAGE_BOARD_KEY);
  if (!Array.isArray(raw)) return [];
  return raw.filter((entry) => entry && entry.name && entry.text && entry.createdAt);
}

function saveMessageEntries(entries) {
  saveJsonCache(MESSAGE_BOARD_KEY, entries.slice(-24));
}

async function fetchSharedMessages() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${SUPABASE_MESSAGE_TABLE}?select=id,name,text,created_at&order=created_at.desc&limit=24`,
    {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`shared-board-fetch-failed:${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data.map((entry) => ({
    name: entry.name || "家人",
    text: entry.text || "",
    createdAt: entry.created_at || new Date().toISOString(),
  }));
}

async function createSharedMessage(entry) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_MESSAGE_TABLE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: entry.name,
      text: entry.text,
    }),
  });

  if (!response.ok) {
    throw new Error(`shared-board-post-failed:${response.status}`);
  }

  return response.json();
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

function formatMessageTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function setMessageStatus(text) {
  if (messageStatus) {
    messageStatus.textContent = text;
  }
}

function renderMessageBoard(entries = loadMessageEntries()) {
  if (!messageList) return;

  if (!entries.length) {
    messageList.innerHTML = '<p class="loading-row">还没有留言，来写第一条吧。</p>';
    return;
  }

  messageList.innerHTML = entries
    .slice()
    .reverse()
    .map((entry) => `
      <article class="message-card">
        <div class="message-card-top">
          <p class="message-author">${escapeHtml(entry.name)}</p>
          <time class="message-time">${escapeHtml(formatMessageTime(entry.createdAt))}</time>
        </div>
        <p class="message-copy">${escapeHtml(entry.text)}</p>
      </article>
    `)
    .join("");
}

async function syncMessageBoard(options = {}) {
  if (!messageList) return;
  const { silent = false } = options;

  try {
    const sharedEntries = await fetchSharedMessages();
    const orderedEntries = sharedEntries.slice().reverse();
    messageBoardMode = "shared";
    saveMessageEntries(orderedEntries);
    renderMessageBoard(orderedEntries);
    if (!silent) {
      setMessageStatus("全家共享留言板已连接，大家打开网页都能看到这些留言。");
    }
  } catch {
    messageBoardMode = "local";
    renderMessageBoard();
    if (!silent) {
      setMessageStatus("共享留言板暂时没连上，现在先显示这台设备里的留言。");
    }
  }
}

async function handleMessageSubmit(event) {
  event.preventDefault();
  if (!messageNameInput || !messageTextInput || !messageStatus) return;

  const name = messageNameInput.value.trim().slice(0, 20);
  const text = messageTextInput.value.trim().slice(0, 160);

  if (!name || !text) {
    setMessageStatus("名字和留言都写一点，发布后才会显示出来。");
    return;
  }

  const entry = {
    name,
    text,
    createdAt: new Date().toISOString(),
  };

  if (messageBoardMode === "shared") {
    try {
      await createSharedMessage(entry);
      await syncMessageBoard({ silent: true });
    } catch {
      const entries = loadMessageEntries();
      entries.push(entry);
      saveMessageEntries(entries);
      renderMessageBoard(entries);
      messageBoardMode = "local";
      setMessageStatus("共享发布失败，这条留言先保存在这台设备里了。");
      messageNameInput.value = name;
      messageTextInput.value = "";
      return;
    }
  } else {
    const entries = loadMessageEntries();
    entries.push(entry);
    saveMessageEntries(entries);
    renderMessageBoard(entries);
    setMessageStatus("留言先保存在这台设备里；等共享表连好后，我们再切回全家共享。");
  }

  messageNameInput.value = name;
  messageTextInput.value = "";
  if (messageBoardMode === "shared") {
    setMessageStatus("发布成功，这条留言全家人现在都能看到了。");
  }
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
      const link = item.link || "https://www.reuters.com/world/";

      return `
        <a class="news-item" href="${link}" target="_blank" rel="noreferrer">
          <p class="news-source">${source}</p>
          <p class="news-title">${title}</p>
        </a>
      `;
    })
    .join("");
}

function renderBlessingWall() {
  if (!blessingList) return;

  blessingList.innerHTML = blessingMessages
    .map((message) => `<div class="blessing-item">${highlightBlessingKeywords(message)}</div>`)
    .join("");
}

function highlightBlessingKeywords(message) {
  const escaped = escapeHtml(message);
  const sortedKeywords = [...new Set(blessingKeywords)].sort((a, b) => b.length - a.length);
  return sortedKeywords.reduce((text, keyword) => {
    const pattern = new RegExp(keyword, "g");
    return text.replace(
      pattern,
      `<span class="blessing-keyword">${keyword}</span>`,
    );
  }, escaped);
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
      timeZone: "Asia/Shanghai",
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
    timeZone: "Asia/Shanghai",
  }).formatToParts(date);

  return {
    month: parts.find((part) => part.type === "month")?.value || "",
    day: parts.find((part) => part.type === "day")?.value || "",
  };
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

function getChinaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value || "0"),
    month: Number(parts.find((part) => part.type === "month")?.value || "1"),
    day: Number(parts.find((part) => part.type === "day")?.value || "1"),
  };
}

function diffDays(from, to) {
  const start = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const end = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.round((end - start) / 86400000);
}

function findNextLunarBirthday(targetMonth, targetDay, fromDate) {
  const start = new Date(Date.UTC(
    fromDate.getUTCFullYear(),
    fromDate.getUTCMonth(),
    fromDate.getUTCDate(),
  ));

  for (let offset = 0; offset <= 400; offset += 1) {
    const probe = new Date(start);
    probe.setUTCDate(start.getUTCDate() + offset);
    const lunar = getLunarMonthDay(probe);

    if (lunar.month === targetMonth && lunar.day === targetDay) {
      return probe;
    }
  }

  return null;
}

function getLunarBirthdays() {
  const cache = loadJsonCache(BIRTHDAY_CACHE_KEY);
  const cacheMap = cache?.entries || {};
  let changed = false;

  const result = familyBirthdays.map((person) => {
    if (person.lunarOverride?.month && person.lunarOverride?.day) {
      return { ...person, lunarBirth: person.lunarOverride };
    }

    const cached = cacheMap[person.birth];
    if (cached?.month && cached?.day) {
      return { ...person, lunarBirth: cached };
    }

    const birthDate = parseBirthDate(person.birth);
    if (!birthDate) return null;

    const lunarBirth = getLunarMonthDay(birthDate);
    cacheMap[person.birth] = lunarBirth;
    changed = true;
    return { ...person, lunarBirth };
  }).filter(Boolean);

  if (changed || !cache) {
    saveJsonCache(BIRTHDAY_CACHE_KEY, { entries: cacheMap });
  }

  return result;
}

function getTodayCacheKey(date) {
  const { year, month, day } = getChinaDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getChinaTodayDate(date = new Date()) {
  const { year, month, day } = getChinaDateParts(date);
  return new Date(Date.UTC(year, month - 1, day));
}

function updateBirthdayReminder() {
  if (!birthdayName || !birthdayMeta) return;

  const now = new Date();
  const today = getChinaTodayDate(now);

  if (BIRTHDAY_PREVIEW_MODE) {
    const previewBirthday = {
      name: "爷爷",
      lunarLabel: "五月16",
      daysLeft: 0,
    };
    updateBirthdayHero(previewBirthday);
    birthdayName.textContent = `${previewBirthday.name} 今天过生日啦`;
    birthdayMeta.textContent = `今天是农历${previewBirthday.lunarLabel}，正好生日。`;
    return;
  }

  const todayKey = getTodayCacheKey(now);
  const upcomingCache = loadJsonCache(BIRTHDAY_TODAY_CACHE_KEY);

  if (upcomingCache?.todayKey === todayKey && upcomingCache.upcoming) {
    const upcoming = upcomingCache.upcoming;
    updateBirthdayHero(upcoming);
    birthdayName.textContent =
      upcoming.daysLeft === 0 ? `${upcoming.name} 今天过生日啦` : `${upcoming.name} 快过生日啦`;
    birthdayMeta.textContent =
      upcoming.daysLeft === 0
        ? `今天是农历${upcoming.lunarLabel}，正好生日。`
        : `农历${upcoming.lunarLabel}，还有 ${upcoming.daysLeft} 天。`;
    return;
  }

  const candidates = getLunarBirthdays()
    .map((person) => {
      const nextBirthday = findNextLunarBirthday(
        person.lunarBirth.month,
        person.lunarBirth.day,
        today,
      );
      if (!nextBirthday) return null;

      return {
        ...person,
        lunarLabel: `${person.lunarBirth.month}${person.lunarBirth.day}`,
        nextBirthday: nextBirthday.toISOString(),
        daysLeft: diffDays(today, nextBirthday),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.daysLeft - right.daysLeft);

  const upcoming = candidates[0];

  if (!upcoming) {
    updateBirthdayHero(null);
    birthdayName.textContent = "暂时算不出来";
    birthdayMeta.textContent = "生日提醒加载失败。";
    return;
  }

  saveJsonCache(BIRTHDAY_TODAY_CACHE_KEY, {
    todayKey,
    upcoming: {
      name: upcoming.name,
      lunarLabel: upcoming.lunarLabel,
      daysLeft: upcoming.daysLeft,
    },
  });

  updateBirthdayHero(upcoming);
  birthdayName.textContent =
    upcoming.daysLeft === 0 ? `${upcoming.name} 今天过生日啦` : `${upcoming.name} 快过生日啦`;

  if (upcoming.daysLeft === 0) {
    birthdayMeta.textContent = `今天是农历${upcoming.lunarLabel}，正好生日。`;
  } else {
    birthdayMeta.textContent =
      `农历${upcoming.lunarLabel}，还有 ${upcoming.daysLeft} 天。`;
  }
}

function updateBirthdayHero(upcoming) {
  if (!birthdayHeroBanner || !birthdayHeroText || !mainHeadline || !heroCopy) return;

  if (upcoming?.daysLeft === 0) {
    birthdayHeroBanner.hidden = false;
    if (blessingWall) blessingWall.hidden = false;
    if (familyExtra) familyExtra.open = false;
    if (foodExtra) foodExtra.open = false;
    if (turnipExtra) turnipExtra.open = false;
    document.body.classList.add("birthday-page");
    birthdayHeroText.textContent = `今天给 ${upcoming.name} 过生日啦`;
    mainHeadline.innerHTML = `🚀 祝 ${upcoming.name} 生日快乐<br />今天一路发发发`;
    heroCopy.classList.add("birthday-mode");
    return;
  }

  birthdayHeroBanner.hidden = true;
  if (blessingWall) blessingWall.hidden = true;
  if (familyExtra) familyExtra.open = true;
  if (turnipExtra) turnipExtra.open = true;
  document.body.classList.remove("birthday-page");
  mainHeadline.innerHTML = "祝 YIYA YIFAN 发大财<br />大头菜大赢家";
  heroCopy.classList.remove("birthday-mode");
}

function updateDailyQuote() {
  if (!dailyQuote) return;

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayIndex = Math.floor((now - startOfYear) / 86400000);
  const quote = dailyQuotes[dayIndex % dailyQuotes.length];
  dailyQuote.textContent = quote;
}

function updateTodayInfo() {
  const now = new Date();

  if (todayDate) {
    todayDate.textContent = new Intl.DateTimeFormat("zh-CN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Shanghai",
    }).format(now);
  }

  if (turkeyTime) {
    turkeyTime.textContent = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Europe/Istanbul",
    }).format(now);
  }

  if (chinaTime) {
    chinaTime.textContent = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
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

  return {
    label: `${prefix}${change.toFixed(1)}%`,
    className,
  };
}

function renderFoodBoard() {
  if (!foodGrid || !foodStatus) return;

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
    const responses = await Promise.all(
      NEWS_FEEDS.map(async (feed) => {
        const response = await fetch(feed.url, {
          headers: { accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        return items.slice(0, 3).map((item) => ({
          title: item.title,
          source: feed.source,
          link: item.link,
          pubDate: item.pubDate || "",
        }));
      }),
    );

    const items = responses
      .flat()
      .sort((left, right) => String(right.pubDate).localeCompare(String(left.pubDate)));

    if (!items.length) {
      throw new Error("No items");
    }

    renderNews(items);
    newsStatus.textContent = "显示 4 条世界头条，来源改为 Reuters / BBC。";
  } catch (error) {
    renderNews(fallbackHeadlines);
    newsStatus.textContent = "实时头条暂时不可用，先显示 Reuters / BBC 备用提示。";
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

if (messageForm) {
  messageForm.addEventListener("submit", handleMessageSubmit);
}

createInputs();
render();
renderBlessingWall();
renderFoodBoard();
renderMessageBoard();
syncMessageBoard();
window.setInterval(() => {
  if (document.visibilityState === "visible") {
    syncMessageBoard({ silent: true });
  }
}, MESSAGE_REFRESH_MS);
updateTodayInfo();
updateBirthdayReminder();
updateDailyQuote();
updatePlaceTime();
loadCryptoPrices();
loadNewsHeadlines();
loadPlacesWeather();
window.setInterval(updateTodayInfo, 1000);
window.setInterval(updateBirthdayReminder, 60 * 60_000);
window.setInterval(updateDailyQuote, 60 * 60_000);
window.setInterval(updatePlaceTime, 30_000);
window.setInterval(loadCryptoPrices, 60_000);
window.setInterval(loadNewsHeadlines, 10 * 60_000);
window.setInterval(loadPlacesWeather, 10 * 60_000);
