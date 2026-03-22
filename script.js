const apiUrl =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=false&price_change_percentage=24h";

const fallbackCoins = [
  {
    market_cap_rank: 1,
    name: "Bitcoin",
    symbol: "btc",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 84250,
    price_change_percentage_24h: 2.84,
    market_cap: 1660000000000,
    total_volume: 32400000000,
  },
  {
    market_cap_rank: 2,
    name: "Ethereum",
    symbol: "eth",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 4580,
    price_change_percentage_24h: 1.42,
    market_cap: 551000000000,
    total_volume: 21000000000,
  },
  {
    market_cap_rank: 3,
    name: "Solana",
    symbol: "sol",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    current_price: 188.14,
    price_change_percentage_24h: 5.96,
    market_cap: 81200000000,
    total_volume: 4300000000,
  },
  {
    market_cap_rank: 4,
    name: "BNB",
    symbol: "bnb",
    image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    current_price: 612.91,
    price_change_percentage_24h: -0.82,
    market_cap: 89300000000,
    total_volume: 1900000000,
  },
  {
    market_cap_rank: 5,
    name: "XRP",
    symbol: "xrp",
    image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
    current_price: 1.27,
    price_change_percentage_24h: 3.21,
    market_cap: 70100000000,
    total_volume: 2700000000,
  },
  {
    market_cap_rank: 6,
    name: "Dogecoin",
    symbol: "doge",
    image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
    current_price: 0.21,
    price_change_percentage_24h: -2.11,
    market_cap: 29900000000,
    total_volume: 1200000000,
  },
  {
    market_cap_rank: 7,
    name: "Toncoin",
    symbol: "ton",
    image: "https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png",
    current_price: 6.31,
    price_change_percentage_24h: 4.63,
    market_cap: 21900000000,
    total_volume: 360000000,
  },
  {
    market_cap_rank: 8,
    name: "Cardano",
    symbol: "ada",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    current_price: 0.82,
    price_change_percentage_24h: -1.56,
    market_cap: 29100000000,
    total_volume: 640000000,
  },
  {
    market_cap_rank: 9,
    name: "Avalanche",
    symbol: "avax",
    image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
    current_price: 41.88,
    price_change_percentage_24h: 6.2,
    market_cap: 17200000000,
    total_volume: 760000000,
  },
  {
    market_cap_rank: 10,
    name: "Shiba Inu",
    symbol: "shib",
    image: "https://assets.coingecko.com/coins/images/11939/large/shiba.png",
    current_price: 0.0000312,
    price_change_percentage_24h: -3.42,
    market_cap: 18300000000,
    total_volume: 510000000,
  },
  {
    market_cap_rank: 11,
    name: "Chainlink",
    symbol: "link",
    image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
    current_price: 18.46,
    price_change_percentage_24h: 0.24,
    market_cap: 10900000000,
    total_volume: 430000000,
  },
  {
    market_cap_rank: 12,
    name: "Polkadot",
    symbol: "dot",
    image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
    current_price: 8.14,
    price_change_percentage_24h: -1.14,
    market_cap: 11700000000,
    total_volume: 290000000,
  },
];

const tableBody = document.querySelector("#tableBody");
const refreshButton = document.querySelector("#refreshButton");
const statusText = document.querySelector("#statusText");

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1_000_000_000 ? "compact" : "standard",
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

function formatChange(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

function getChangeClass(value) {
  if (value > 0.2) return "change-positive";
  if (value < -0.2) return "change-negative";
  return "change-neutral";
}

function getMomentumLabel(change) {
  if (change >= 4) {
    return { label: "Bullish", className: "momentum-bullish" };
  }

  if (change <= -4) {
    return { label: "Bearish", className: "momentum-bearish" };
  }

  return { label: "Balanced", className: "momentum-neutral" };
}

function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function renderSpotlight(containerId, coin) {
  const container = document.querySelector(containerId);
  if (!coin) {
    container.innerHTML = "<p>No market data available.</p>";
    return;
  }

  container.innerHTML = `
    <div class="coin-header">
      <img src="${coin.image}" alt="${coin.name} logo" />
      <div>
        <p class="coin-name">${coin.name}</p>
        <p class="coin-symbol">${coin.symbol}</p>
      </div>
    </div>
    <div class="spotlight-stat">
      <span>Price</span>
      <strong>${formatCurrency(coin.current_price)}</strong>
    </div>
    <div class="spotlight-stat">
      <span>24H Change</span>
      <strong class="${getChangeClass(coin.price_change_percentage_24h)}">${formatChange(
        coin.price_change_percentage_24h,
      )}</strong>
    </div>
    <div class="spotlight-stat">
      <span>24H Volume</span>
      <strong>${formatCurrency(coin.total_volume)}</strong>
    </div>
  `;
}

function renderMetrics(coins) {
  const changes = coins.map((coin) => coin.price_change_percentage_24h || 0);
  const average = changes.reduce((sum, value) => sum + value, 0) / changes.length;
  const positiveCount = changes.filter((value) => value > 0).length;
  const negativeCount = changes.filter((value) => value < 0).length;

  let mood = "Sideways";
  let moodDetail = "Buyers and sellers look fairly balanced right now.";

  if (average > 1.5 && positiveCount >= negativeCount * 1.5) {
    mood = "Risk-On";
    moodDetail = "Broad participation suggests buyers are driving the tape.";
  } else if (average < -1.5 && negativeCount >= positiveCount * 1.5) {
    mood = "Risk-Off";
    moodDetail = "Weak breadth suggests the market is trading defensively.";
  }

  document.querySelector("#marketMood").textContent = mood;
  document.querySelector("#marketMoodDetail").textContent = moodDetail;
  document.querySelector("#averageChange").textContent = formatChange(average);
  document.querySelector("#averageChange").className = getChangeClass(average);
  document.querySelector("#breadthRatio").textContent = `${positiveCount}:${negativeCount}`;
  document.querySelector("#lastUpdated").textContent = formatTime(new Date());
}

function renderTable(coins) {
  tableBody.innerHTML = coins
    .map((coin) => {
      const momentum = getMomentumLabel(coin.price_change_percentage_24h || 0);

      return `
        <tr>
          <td class="rank">${coin.market_cap_rank ?? "--"}</td>
          <td>
            <div class="coin-cell">
              <img src="${coin.image}" alt="${coin.name} logo" />
              <div>
                <div>${coin.name}</div>
                <div class="coin-symbol">${coin.symbol}</div>
              </div>
            </div>
          </td>
          <td class="price">${formatCurrency(coin.current_price)}</td>
          <td class="${getChangeClass(coin.price_change_percentage_24h || 0)}">
            ${formatChange(coin.price_change_percentage_24h || 0)}
          </td>
          <td class="mono">${formatCurrency(coin.market_cap)}</td>
          <td class="mono">${formatCurrency(coin.total_volume)}</td>
          <td>
            <span class="momentum-pill ${momentum.className}">
              ${momentum.label}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadDashboard() {
  refreshButton.disabled = true;
  statusText.textContent = "Updating live market snapshot...";

  try {
    const response = await fetch(apiUrl, {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const coins = await response.json();
    updateDashboard(coins, false);
  } catch (error) {
    updateDashboard(fallbackCoins, true);
    statusText.textContent =
      "Live API unavailable, showing fallback demo market data.";
    console.error(error);
  } finally {
    refreshButton.disabled = false;
  }
}

function updateDashboard(coins, isFallback) {
  const rankedCoins = [...coins].sort(
    (left, right) => (left.market_cap_rank ?? 999) - (right.market_cap_rank ?? 999),
  );
  const leader = [...rankedCoins].sort(
    (left, right) =>
      (right.price_change_percentage_24h || 0) - (left.price_change_percentage_24h || 0),
  )[0];
  const laggard = [...rankedCoins].sort(
    (left, right) =>
      (left.price_change_percentage_24h || 0) - (right.price_change_percentage_24h || 0),
  )[0];

  renderMetrics(rankedCoins);
  renderSpotlight("#leaderCard", leader);
  renderSpotlight("#laggardCard", laggard);
  renderTable(rankedCoins);

  if (!isFallback) {
    statusText.textContent = "Live data loaded from CoinGecko.";
  }
}

refreshButton.addEventListener("click", loadDashboard);
loadDashboard();
