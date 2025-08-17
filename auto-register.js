// ==UserScript==
// @name         auto-register
// @namespace    http://tampermonkey.net/
// @version      2025-08-16
// @description  パビリオン自動申し込み
// @author       to
// @match        https://ticket.expo2025.or.jp/event_time/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=expo2025.or.jp
// @grant        none
// ==/UserScript==

(function() {
  let timerId = null;

  function createControls() {
    if (document.getElementById("autoReserveToggle")) return;

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "10px";
    container.style.right = "10px";
    container.style.zIndex = 9999;
    container.style.display = "flex";
    container.style.gap = "6px";
    container.style.alignItems = "center";
    document.body.appendChild(container);

    const toggleBtn = document.createElement("button");
    toggleBtn.id = "autoReserveToggle";
    toggleBtn.style.padding = "8px 12px";
    toggleBtn.style.fontSize = "14px";
    toggleBtn.style.border = "none";
    toggleBtn.style.borderRadius = "6px";
    toggleBtn.style.color = "#fff";
    toggleBtn.style.cursor = "pointer";
    container.appendChild(toggleBtn);

    // インターバル入力
    const input = document.createElement("input");
    input.id = "autoReserveInterval";
    input.type = "number";
    input.min = "2";
    input.style.width = "60px";
    input.style.padding = "6px";
    input.style.fontSize = "14px";
    input.style.border = "1px solid #ccc";
    input.style.borderRadius = "6px";
    container.appendChild(input);

    const label = document.createElement("span");
    label.textContent = "秒";
    label.style.fontSize = "14px";
    container.appendChild(label);

    function updateButtonUI(isOn) {
      if (isOn) {
        toggleBtn.textContent = "▶ 自動申込 ON";
        toggleBtn.style.background = "#4caf50";
      } else {
        toggleBtn.textContent = "⏹ 自動申込 OFF";
        toggleBtn.style.background = "#f44";
      }
    }

    function setAutoReserve(isOn) {
      const intervalSec = parseInt(input.value, 10) || 10;
      localStorage.setItem("autoReserveInterval", intervalSec);

      if (isOn) {
        timerId = setInterval(() => {
          location.reload();
        }, intervalSec * 1000);
        localStorage.setItem("autoReserve", "true");
        updateButtonUI(true);
        console.log(`🚀 自動処理を開始しました（${intervalSec}秒ごと）`);
      } else {
        clearInterval(timerId);
        timerId = null;
        localStorage.setItem("autoReserve", "false");
        updateButtonUI(false);
        console.log("🛑 自動処理を停止しました");
      }
    }

    toggleBtn.addEventListener("click", () => {
      const isOn = localStorage.getItem("autoReserve") === "true";
      setAutoReserve(!isOn);
    });

    // 入力値保存
    input.addEventListener("change", () => {
      const intervalSec = parseInt(input.value, 10);
      if (!isNaN(intervalSec) && intervalSec >= 2) {
        localStorage.setItem("autoReserveInterval", intervalSec);
        console.log(`⏱ インターバルを ${intervalSec} 秒に設定しました`);
        if (localStorage.getItem("autoReserve") === "true") {
          clearInterval(timerId);
          setAutoReserve(true); // 新しい値で再スタート
        }
      }
    });

    // 初期値を復元
    input.value = localStorage.getItem("autoReserveInterval") || "10";
    const initialOn = localStorage.getItem("autoReserve") === "true";
    setAutoReserve(initialOn);
  }

  function checkAndReserve() {
    const radios = document.querySelectorAll('input[name="date_picker"].style_time_picker__radio__1c6YB');
    const enabledRadio = Array.from(radios).find(r => !r.disabled);

    if (enabledRadio) {
      enabledRadio.checked = true;
      const button = document.querySelector('button.basic-btn.type2.style_reservation_next_link__7gOxy:not([disabled])');
      if (button) {
        button.click();
        console.log("✅ ボタンをクリックしました");

        // 成功したら自動OFF
        clearInterval(timerId);
        timerId = null;
        localStorage.setItem("autoReserve", "false");
        const toggleBtn = document.getElementById("autoReserveToggle");
        if (toggleBtn) {
          toggleBtn.textContent = "⏹ 自動申込 OFF";
          toggleBtn.style.background = "#f44";
        }
        console.log("🛑 成功したので自動処理を停止しました");
      } else {
        console.log("⚠️ ボタンが無効です");
      }
    } else {
      console.log("⏳ 選択可能な時間帯がありません");
    }
  }

  window.addEventListener("load", () => {
    createControls();
    if (localStorage.getItem("autoReserve") === "true") {
      checkAndReserve();
    }
  });
})();
