const STORAGE_KEY = "turnip-tracker-week";

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

function persistAndRender(message) {
  saveState();
  render();
  statusText.textContent = message;
}

buyPriceInput.addEventListener("input", (event) => {
  state.buyPrice = event.target.value;
  persistAndRender("已更新周日买入价。");
});

sampleButton.addEventListener("click", () => {
  state = structuredClone(sampleWeek);
  createInputs();
  persistAndRender("已填入一组示例数据，方便你先看页面效果。");
});

resetButton.addEventListener("click", () => {
  state = structuredClone(defaultState);
  createInputs();
  persistAndRender("本周记录已清空。");
});

createInputs();
render();
