var b = Object.defineProperty;
var k = (s, t, e) => t in s ? b(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var c = (s, t, e) => k(s, typeof t != "symbol" ? t + "" : t, e);
import { html as x, isReadable as T, derived as v, writable as f, node as D, opt as E, call as R, loop as z, tick as C, dispose as B } from "@adernnell/simplereactivedom";
import './toaster.css'
const Y = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
}, I = (s, t = {}) => {
  if ("size" in t) {
    const n = t.size;
    delete t.size, t.width = n, t.height = n;
  }
  const e = {
    ...Y,
    ...t
  };
  return M(["svg", e, s]);
}, M = ([s, t, e]) => {
  const n = document.createElementNS("http://www.w3.org/2000/svg", s);
  return Object.keys(t).forEach((o) => {
    n.setAttribute(o, String(t[o]));
  }), e != null && e.length && e.forEach((o) => {
    const a = M(o);
    n.appendChild(a);
  }), n;
}, F = {
  size: 14,
  speed: 0.5
}, U = (s = {}) => {
  const t = { ...F, ...s }, e = 0.2 + 0.8 * (1 - t.speed);
  return x`
		<svg width="${t.size}" height="${t.size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="npop-anim loading">
			<path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z">
				<animateTransform attributeName="transform" type="rotate" dur="${e}s" values="0 12 12;360 12 12" repeatCount="indefinite"/>
			</path>
		</svg>
	`;
};
/**
* @license lucide v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const L = [
  ["circle", { cx: "12", cy: "12", r: "10" }],
  ["path", { d: "m9 12 2 2 4-4" }]
];
/**
* @license lucide v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const W = [
  ["circle", { cx: "12", cy: "12", r: "10" }],
  ["path", { d: "m15 9-6 6" }],
  ["path", { d: "m9 9 6 6" }]
];
/**
* @license lucide v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const X = [
  ["circle", { cx: "12", cy: "12", r: "10" }],
  ["path", { d: "M12 16v-4" }],
  ["path", { d: "M12 8h.01" }]
];
/**
* @license lucide v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const j = [
  ["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }],
  ["path", { d: "M12 9v4" }],
  ["path", { d: "M12 17h.01" }]
];
/**
* @license lucide v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const H = [
  ["path", { d: "M18 6 6 18" }],
  ["path", { d: "m6 6 12 12" }]
], p = (s, t, e) => new Promise((n) => {
  const o = s.animate(t, e);
  o.onfinish = n;
});
var d = /* @__PURE__ */ ((s) => (s.Default = "default", s.Success = "success", s.Info = "info", s.Warning = "warning", s.Error = "error", s.Promise = "promise", s))(d || {});
const N = {
  success: L,
  info: X,
  warning: j,
  error: W
}, _ = {
  type: "default",
  appearDuration: 200,
  dismissDuration: 350,
  manualDismissDuration: 200,
  disappearDuration: 350
}, $ = (s) => typeof s == "string" ? s : s.title, A = (s) => typeof s == "object" ? s.description : void 0, P = (s) => {
  if (s === "default") return;
  if (s === "promise") return D(U());
  const t = N[s];
  if (t) return I(t);
}, G = (s) => {
  var y;
  const t = { ..._, ...s }, e = T(t.msg) ? v(t.msg, (h) => $(h)) : f($(t.msg)), n = T(t.msg) ? v(t.msg, (h) => A(h)) : f(A(t.msg)), o = T(t.type) ? v(t.type, (h) => P(h)) : f(P(t.type)), a = f(!1), i = v(a, (h) => h ? "overflowed" : ""), r = D(x`
        <li class="npop-toast ${t.type} ${i}" role="alert">
            <div class="icon">${E(o)}</div>
            <div class="content">
                <p class="message">${e}</p>
                <p class="description ${n ? "" : "hidden"}" title="${n}">${E(n)}</p>
            </div>
            <div class="close" onclick=${R(() => g())}>${I(H)}</div>
        </li>
    `);
  let m = !1, l = !1, u = !1;
  const g = async () => {
    var w;
    if (l) return;
    l = !0;
    const h = r.getBoundingClientRect().width;
    await p(
      r,
      [
        { opacity: 1, transform: "translateX(0)" },
        { opacity: 0, transform: `translateX(${h}px)` }
      ],
      { duration: t.manualDismissDuration, fill: "forwards", easing: "ease-in" }
    ), (w = t.onDismissed) == null || w.call(t);
  }, O = {
    element: r,
    appear: async () => {
      m || (m = !0, await p(r, [{ opacity: 0 }, { opacity: 1 }], {
        duration: t.appearDuration,
        fill: "forwards",
        easing: "linear"
      }));
    },
    dismiss: async () => {
      var w;
      if (l) return;
      l = !0;
      const h = r.getBoundingClientRect().height;
      await p(
        r,
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: `translateY(${h}px)` }
        ],
        { duration: t.dismissDuration, fill: "forwards", easing: "ease-in" }
      ), (w = t.onDismissed) == null || w.call(t);
    },
    overflow: async () => {
      u || (u = !0, await p(r, [{ opacity: 1 }, { opacity: 0 }], {
        duration: t.disappearDuration,
        fill: "forwards",
        easing: "linear"
      }), a.set(!0));
    },
    isAppearing: () => m,
    isDismissing: () => l,
    isOverflowing: () => u
  };
  return (y = t.controllerRetriever) == null || y.call(t, O), r;
}, V = {
  gap: 8,
  maxToasts: 5,
  moveUpDuration: 200,
  moveDownDuration: 200
}, Z = (s) => {
  const t = { ...V, ...s };
  let e = [];
  const n = (i, r, m) => {
    i.forEach((l, u) => {
      p(
        l,
        [{ transform: `translateY(${r + m}px)` }, { transform: "translateY(0)" }],
        { duration: t.moveUpDuration, fill: "forwards", easing: "ease" }
      );
    });
  }, o = (i, r, m) => {
    i.forEach((l, u) => {
      p(
        l,
        [{ transform: `translateY(-${r + m}px)` }, { transform: "translateY(0)" }],
        { duration: t.moveDownDuration, fill: "forwards", easing: "ease" }
      );
    });
  }, a = D(x`
      <div class="cmp-toaster">
        <style type="text/css">.npop-toast-container{position:fixed;bottom:1rem;right:1rem;display:flex;flex-direction:column;gap:var(--gap, 8px);margin:0;padding:0}.npop-toast-container .npop-toast{display:flex;align-items:stretch;width:300px;min-height:48px;border-radius:8px;box-shadow:0 2px 8px #00000026;color:#fff;opacity:0;background-color:#333}.npop-toast-container .npop-toast .icon{margin:8px 12px 8px 16px;font-size:24px;max-width:16px;display:flex;align-items:center}.npop-toast-container .npop-toast .icon .npop-anim.loading{fill:#fff}.npop-toast-container .npop-toast .content{margin:12px 0;padding-bottom:2px;display:flex;flex-direction:column;justify-content:center;gap:2px;flex-grow:1}.npop-toast-container .npop-toast .content .message{font-weight:400;margin:0;font-size:14px}.npop-toast-container .npop-toast .content .description{font-weight:lighter;margin:0;font-size:12px}.npop-toast-container .npop-toast .content .description.hidden{display:none}.npop-toast-container .npop-toast .close{margin:0;width:48px;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center}.npop-toast-container .npop-toast .close svg{width:16px;height:16px;opacity:0}.npop-toast-container .npop-toast:hover .close svg{opacity:1}.npop-toast-container .npop-toast.overflowed{display:none}</style>
        <ul class="npop-toast-container" style="--gap: ${t.gap}px">
            ${z().each(t.toasts, (i) => i.element)}
        </ul>
      </div>
    `);
  return t.toasts.subscribe((i) => {
    if (i.length > e.length) {
      const r = i.map((l) => l.element), m = i[i.length - 1];
      C().then(() => {
        const l = m.element.getBoundingClientRect().height;
        n(r, l, t.gap), m.appear();
      });
    } else if (i.length < e.length && i.length > 0) {
      const r = e.findIndex((g) => !i.includes(g)), l = e[r].element.getBoundingClientRect().height, u = e.slice(0, r).map((g) => g.element);
      C().then(() => {
        o(u, l, t.gap);
      });
    }
    if (t.maxToasts && t.maxToasts !== -1 && i.length > t.maxToasts) {
      const r = i.length - t.maxToasts;
      i.slice(0, r).filter((l) => !l.isOverflowing()).forEach((l) => l.overflow());
    }
    e = [...i];
  }), a;
}, S = 5e3;
class q {
  constructor() {
    c(this, "container");
    c(this, "el");
    c(this, "toasts", f([]));
    c(this, "timeoutTimers", /* @__PURE__ */ new Map());
    c(this, "timersPaused", !1);
    c(this, "maxToasts");
    c(this, "showToast", (t, e, n = S) => {
      if (!this.container) return;
      let o;
      return G({
        type: t,
        msg: e,
        controllerRetriever: (a) => {
          o = a;
        },
        onDismissed: () => {
          const a = this.timeoutTimers.get(o);
          a != null && a.timer && clearTimeout(a.timer), this.timeoutTimers.delete(o), this.toasts.update((i) => (i.splice(i.indexOf(o), 1), i)), o = void 0;
        }
      }), this.toasts.update((a) => (a.push(o), a)), n !== -1 && this.startTimerForToast(o, n), o;
    });
    c(this, "showMessage", (t, e) => {
      this.showToast(d.Default, t, e);
    });
    c(this, "showSuccess", (t, e) => {
      this.showToast(d.Success, t, e);
    });
    c(this, "showInfo", (t, e) => {
      this.showToast(d.Info, t, e);
    });
    c(this, "showWarning", (t, e) => {
      this.showToast(d.Warning, t, e);
    });
    c(this, "showError", (t, e) => {
      this.showToast(d.Error, t, e);
    });
    c(this, "showPromise", (t, e, n = S) => {
      const o = f(d.Promise), a = f(e.loading), i = this.showToast(o, a, -1);
      t.then(() => {
        o.set(d.Success), a.set(e.success), this.startTimerForToast(i, n);
      }).catch((r) => {
        o.set(d.Error), a.set(
          typeof e.error == "function" ? e.error(r) : e.error
        ), this.startTimerForToast(i, n);
      });
    });
    c(this, "clearAll", () => {
      this.toasts.set([]), this.timeoutTimers.forEach((t) => {
        t.timer && clearTimeout(t.timer);
      }), this.timeoutTimers.clear();
    });
    this.maxToasts = 5;
  }
  initToastContainer(t) {
    if (t !== this.container) {
      const e = Z({ toasts: this.toasts, maxToasts: this.maxToasts });
      this.el && this.container && (this.container.removeChild(this.el), B(this.el)), t.appendChild(e), this.el = e, this.container = t, e.addEventListener("mouseenter", () => this.pauseAllTimers()), e.addEventListener("mouseleave", () => this.resumeAllTimers());
    }
  }
  pauseAllTimers() {
    this.timersPaused || (this.timersPaused = !0, this.timeoutTimers.forEach((t, e) => {
      t.timer && (clearTimeout(t.timer), t.timer = void 0, t.remaining -= Date.now() - t.start);
    }));
  }
  resumeAllTimers() {
    this.timersPaused && (this.timersPaused = !1, this.timeoutTimers.forEach((t, e) => {
      !t.timer && t.remaining > 0 && (t.start = Date.now(), t.timer = window.setTimeout(() => {
        t.timer = void 0, e.dismiss();
      }, t.remaining));
    }));
  }
  startTimerForToast(t, e) {
    const n = Date.now(), o = window.setTimeout(() => {
      t.dismiss();
    }, e);
    this.timeoutTimers.set(t, { timer: o, remaining: e, start: n });
  }
}
const Q = new q();
export {
  G as Toast,
  Z as ToastContainer,
  d as ToastType,
  Q as toastService
};
