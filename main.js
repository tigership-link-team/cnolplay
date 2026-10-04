/* CNOL — cnolplay.com
   - 모션·호버: HR Motion Kit (motion-head.js / motion.css / motion.js — whrcompany.com 메인과 동일)
   - Material Design 3: 리플, 상단 바, 내비게이션 드로어, 확장형 FAB
   - 문의 폼 → Supabase(cnolplay_inquiries) 저장 (익명 insert 전용) */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===== Material: ripple ===== */
  function initRipple() {
    document.addEventListener("pointerdown", function (e) {
      var host = e.target.closest && e.target.closest(".ripple, .state");
      if (!host || reduce) return;
      var r = host.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2.2;
      var wave = document.createElement("span");
      wave.className = "ripple-wave";
      wave.style.width = wave.style.height = size + "px";
      wave.style.left = (e.clientX - r.left - size / 2) + "px";
      wave.style.top = (e.clientY - r.top - size / 2) + "px";
      host.appendChild(wave);
      var end = function () {
        wave.classList.add("out");
        setTimeout(function () { wave.remove(); }, 600);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
      };
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
    });
  }

  /* ===== Material: top app bar, drawer, FAB ===== */
  var drawerBtn = document.querySelector("[data-drawer-open]");
  var drawer = document.getElementById("drawer");
  function openDrawer() {
    document.body.classList.add("drawer-open");
    if (drawer) drawer.setAttribute("aria-hidden", "false");
    if (drawerBtn) drawerBtn.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    document.body.classList.remove("drawer-open");
    if (drawer) drawer.setAttribute("aria-hidden", "true");
    if (drawerBtn) drawerBtn.setAttribute("aria-expanded", "false");
  }
  function initChrome() {
    var bar = document.querySelector(".top-bar");
    var fab = document.querySelector(".fab");
    var lastY = window.scrollY;
    function onScroll() {
      var y = window.scrollY;
      if (bar) bar.classList.toggle("scrolled", y > 4);
      if (fab) fab.classList.toggle("shrink", y > 240 && y > lastY);
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (drawerBtn) drawerBtn.addEventListener("click", openDrawer);
    document.querySelectorAll("[data-drawer-close]").forEach(function (b) { b.addEventListener("click", closeDrawer); });
    if (drawer) drawer.addEventListener("click", function (e) { if (e.target.closest("a")) closeDrawer(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
    // 문의 영역이 보이면 FAB 숨김
    var contact = document.getElementById("contact");
    if (fab && contact && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        fab.style.opacity = en[0].isIntersecting ? "0" : "";
        fab.style.pointerEvents = en[0].isIntersecting ? "none" : "";
      }, { threshold: 0.15 }).observe(contact);
      fab.style.transition = "opacity .2s, box-shadow .2s, padding .3s, gap .3s";
    }
  }

  /* ===== 시작 ===== */
  initRipple();
  initChrome();
  window.addEventListener("pageshow", function (ev) { if (ev.persisted) closeDrawer(); });

  /* ===== 문의 폼 ===== */
  var SUPABASE_URL = "https://gkifdofvwvrsmstykayn.supabase.co";
  var SUPABASE_KEY = "sb_publishable_ArLDrMFZ_joTvI9RGmp8jA_HyfnrnvT"; // 공개용(publishable) 키 — 문의 저장만 가능
  var SERVICES = { music: "크놀뮤직 VIP 협업", supply: "음원 공급·제휴", ad: "크놀AD 캠페인", etc: "기타" };

  var form = document.getElementById("inquiry-form");
  if (!form) return;
  var startedAt = Date.now();
  var statusEl = document.getElementById("form-status");
  var submitBtn = form.querySelector("button[type=submit]");
  var submitHTML = submitBtn.innerHTML;

  try {
    var pre = new URLSearchParams(window.location.search).get("service");
    if (pre && SERVICES[pre]) {
      var radio = form.querySelector('input[name="service"][value="' + SERVICES[pre] + '"]');
      if (radio) radio.checked = true;
    }
  } catch (e) { /* 무시 */ }

  function setStatus(msg, kind) {
    statusEl.textContent = msg || "";
    statusEl.className = "form-status" + (kind ? " " + kind : "");
  }
  function clean(v, max) {
    v = String(v == null ? "" : v).replace(/\u0000/g, "").trim();
    return max ? v.slice(0, max) : v;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("");
    var fd = new FormData(form);
    if (clean(fd.get("website"))) return;
    if (Date.now() - startedAt < 2500) { setStatus("잠시 후 다시 눌러주세요.", "err"); return; }

    var payload = {
      service: clean(fd.get("service")),
      name: clean(fd.get("name"), 50),
      company: clean(fd.get("company"), 100) || null,
      email: clean(fd.get("email"), 200),
      phone: clean(fd.get("phone"), 30) || null,
      message: clean(fd.get("message"), 3000),
      agreed_privacy: fd.get("agree") === "on",
      source_page: clean(window.location.pathname + window.location.search, 200)
    };
    var allowed = Object.keys(SERVICES).map(function (k) { return SERVICES[k]; });
    if (allowed.indexOf(payload.service) < 0) return setStatus("문의 분야를 선택해 주세요.", "err");
    if (!payload.name) return setStatus("이름을 입력해 주세요.", "err");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) return setStatus("이메일 주소를 확인해 주세요.", "err");
    if (payload.message.length < 5) return setStatus("문의 내용을 5자 이상 적어주세요.", "err");
    if (!payload.agreed_privacy) return setStatus("개인정보 수집·이용에 동의해 주세요.", "err");

    submitBtn.disabled = true;
    submitBtn.textContent = "보내는 중…";

    fetch(SUPABASE_URL + "/rest/v1/cnolplay_inquiries", {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (res.ok) {
        form.innerHTML =
          '<div class="form-done" role="status">' +
          '<span class="icon-box green"><span class="ms lg">check</span></span>' +
          "<h3>문의가 접수됐어요</h3>" +
          "<p>남겨주신 이메일로 담당자가 연락드리겠습니다.<br>급한 건은 왼쪽 이메일로 바로 보내주셔도 됩니다.</p>" +
          "</div>";
        return;
      }
      return res.text().then(function (t) { throw new Error(/too_many_requests/.test(t) ? "busy" : "fail"); });
    }).catch(function (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitHTML;
      if (err && err.message === "busy") setStatus("짧은 시간에 여러 번 보내셨어요. 10분 뒤에 다시 시도해 주세요.", "err");
      else setStatus("전송하지 못했어요. 잠시 후 다시 시도하시거나 이메일(support@whrcompany.com)로 보내주세요.", "err");
    });
  });
})();
