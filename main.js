/* CNOL — cnolplay.com 공통 스크립트
   - 모바일 메뉴, 스크롤 표시, 등장 애니메이션
   - 문의 폼 → Supabase(cnolplay_inquiries) 저장 (익명 insert 전용, 조회 불가) */
(function () {
  "use strict";

  var SUPABASE_URL = "https://gkifdofvwvrsmstykayn.supabase.co";
  var SUPABASE_KEY = "sb_publishable_ArLDrMFZ_joTvI9RGmp8jA_HyfnrnvT"; // 공개용(publishable) 키 — 문의 저장만 가능
  var SERVICES = {
    music: "크놀뮤직 VIP 협업",
    supply: "음원 공급·제휴",
    ad: "크놀AD 캠페인",
    etc: "기타"
  };

  document.documentElement.classList.remove("no-js");

  /* ---- 헤더 ---- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("scrolled", window.scrollY > 4);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "메뉴 열기");
      }
    });
  }

  /* ---- 등장 애니메이션 ---- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- 문의 폼 ---- */
  var form = document.getElementById("inquiry-form");
  if (!form) return;

  var startedAt = Date.now();
  var statusEl = document.getElementById("form-status");
  var submitBtn = form.querySelector("button[type=submit]");

  // ?service=music|supply|ad|etc 로 문의 분야 미리 선택
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
    if (clean(fd.get("website"))) return; // 스팸 봇용 숨김 칸
    if (Date.now() - startedAt < 2500) {
      setStatus("잠시 후 다시 눌러주세요.", "err");
      return;
    }

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
      headers: {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (res.ok) {
        form.innerHTML =
          '<div class="form-done" role="status">' +
          '<div class="big"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
          "<h3>문의가 접수됐어요</h3>" +
          "<p>남겨주신 이메일로 담당자가 연락드리겠습니다.<br>급한 건은 아래 이메일로 바로 보내주셔도 됩니다.</p>" +
          "</div>";
        return;
      }
      return res.text().then(function (t) {
        var busy = /too_many_requests/.test(t);
        throw new Error(busy ? "busy" : "fail");
      });
    }).catch(function (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = "문의 보내기";
      if (err && err.message === "busy") {
        setStatus("짧은 시간에 여러 번 보내셨어요. 10분 뒤에 다시 시도해 주세요.", "err");
      } else {
        setStatus("전송하지 못했어요. 잠시 후 다시 시도하시거나 이메일(support@whrcompany.com)로 보내주세요.", "err");
      }
    });
  });
})();
