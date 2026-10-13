const form = document.getElementById("purposeForm");
const input = document.getElementById("purposeInput");
const charCount = document.getElementById("charCount");
const resultSection = document.getElementById("resultSection");
const categoryText = document.getElementById("categoryText");
const messageText = document.getElementById("messageText");
const continueButton = document.getElementById("continueButton");
const historyList = document.getElementById("historyList");
const emptyHistory = document.getElementById("emptyHistory");
const totalCount = document.getElementById("totalCount");
const aimlessCount = document.getElementById("aimlessCount");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const appName = document.getElementById("appName");

const params = new URLSearchParams(window.location.search);
const targetApp = params.get("app");
const destination = params.get("to");

if (targetApp) {
  appName.textContent = `${targetApp}を開こうとしています`;
}

input.addEventListener("input", () => {
  charCount.textContent = `${input.value.length} / 100`;
});

function classifyPurpose(text) {
  const value = text.trim().toLowerCase();

  // 今は仮実装です。
  // 後でこの部分をニューラルネットワークによる分類APIに置き換えます。
  const aimlessWords = ["なんとなく", "暇", "ひま", "特にない", "無目的", "とりあえず"];
  const studyWords = ["勉強", "課題", "履修", "授業", "調べ", "学習", "レポート", "研究"];
  const contactWords = ["line", "メール", "連絡", "返信", "電話", "メッセージ"];
  const workWords = ["予定", "スケジュール", "仕事", "バイト", "予約"];
  const entertainmentWords = ["youtube", "instagram", "tiktok", "x", "twitter", "ゲーム", "動画", "sns"];

  if (aimlessWords.some(word => value.includes(word))) {
    return {
      category: "無目的",
      message: "目的のない利用かもしれません。本当に今スマホを開く必要があるか、一度だけ考えてみましょう。"
    };
  }

  if (studyWords.some(word => value.includes(word))) {
    return {
      category: "学習",
      message: "学びにつながる目的ですね。必要なことが終わったら、速やかにスマホを手放しましょう。"
    };
  }

  if (contactWords.some(word => value.includes(word))) {
    return {
      category: "連絡",
      message: "必要な連絡ですね。返信や確認が終わったら、そのまま別のアプリを見続けないよう意識してみましょう。"
    };
  }

  if (workWords.some(word => value.includes(word))) {
    return {
      category: "仕事・予定",
      message: "目的がはっきりしています。必要な確認が終わったら、スマホを閉じましょう。"
    };
  }

  if (entertainmentWords.some(word => value.includes(word))) {
    return {
      category: "娯楽",
      message: "娯楽も大切です。何分使うかを決めてから始めると、だらだら使いにくくなります。"
    };
  }

  return {
    category: "その他",
    message: "目的を言葉にできています。その目的を達成したら、一度スマホから離れてみましょう。"
  };
}

function getTodayKey() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function loadHistory() {
  const all = JSON.parse(localStorage.getItem("purposeHistory") || "[]");
  return all.filter(item => item.date === getTodayKey());
}

function saveHistory(item) {
  const all = JSON.parse(localStorage.getItem("purposeHistory") || "[]");
  all.push(item);
  localStorage.setItem("purposeHistory", JSON.stringify(all));
}

function renderHistory() {
  const history = loadHistory();

  totalCount.textContent = history.length;
  aimlessCount.textContent = history.filter(item => item.category === "無目的").length;

  historyList.innerHTML = "";

  if (history.length === 0) {
    emptyHistory.style.display = "block";
    return;
  }

  emptyHistory.style.display = "none";

  [...history].reverse().forEach(item => {
    const li = document.createElement("li");
    li.className = "history-item";

    li.innerHTML = `
      <div class="history-top">
        <span class="history-purpose"></span>
        <span class="history-category"></span>
      </div>
      <span class="history-time"></span>
    `;

    li.querySelector(".history-purpose").textContent = item.purpose;
    li.querySelector(".history-category").textContent = item.category;
    li.querySelector(".history-time").textContent = item.time;

    historyList.appendChild(li);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const purpose = input.value.trim();
  if (!purpose) return;

  const result = classifyPurpose(purpose);
  const now = new Date();

  categoryText.textContent = result.category;
  messageText.textContent = result.message;
  resultSection.classList.remove("hidden");

  saveHistory({
    purpose,
    category: result.category,
    date: getTodayKey(),
    time: now.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  renderHistory();
});

continueButton.addEventListener("click", () => {
  if (destination) {
    window.location.href = destination;
    return;
  }

  input.value = "";
  charCount.textContent = "0 / 100";
  resultSection.classList.add("hidden");
  input.focus();
});

clearHistoryButton.addEventListener("click", () => {
  const all = JSON.parse(localStorage.getItem("purposeHistory") || "[]");
  const today = getTodayKey();
  const remaining = all.filter(item => item.date !== today);

  localStorage.setItem("purposeHistory", JSON.stringify(remaining));
  renderHistory();
});

renderHistory();
