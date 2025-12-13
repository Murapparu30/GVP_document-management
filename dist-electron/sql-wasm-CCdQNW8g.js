import { g as en } from "./main-CxxBtHYN.js";
import tn from "fs";
import "path";
import rn from "crypto";
function nn(Q, Ue) {
  for (var B = 0; B < Ue.length; B++) {
    const $ = Ue[B];
    if (typeof $ != "string" && !Array.isArray($)) {
      for (const C in $)
        if (C !== "default" && !(C in Q)) {
          const se = Object.getOwnPropertyDescriptor($, C);
          se && Object.defineProperty(Q, C, se.get ? se : {
            enumerable: !0,
            get: () => $[C]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(Q, Symbol.toStringTag, { value: "Module" }));
}
var rr = { exports: {} };
(function(Q, Ue) {
  var B = void 0, $ = function(C) {
    return B || (B = new Promise(function(se, ir) {
      var j = typeof C < "u" ? C : {}, ht = j.onAbort;
      j.onAbort = function(e) {
        ir(new Error(e)), ht && ht(e);
      }, j.postRun = j.postRun || [], j.postRun.push(function() {
        se(j);
      }), Q = void 0;
      var o;
      o ||= typeof j < "u" ? j : {};
      var or = typeof window == "object", De = typeof WorkerGlobalScope < "u", we = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
      o.onRuntimeInitialized = function() {
        function e(s, l) {
          switch (typeof l) {
            case "boolean":
              Kr(s, l ? 1 : 0);
              break;
            case "number":
              Yr(s, l);
              break;
            case "string":
              Gr(s, l, -1, -1);
              break;
            case "object":
              if (l === null) Kt(s);
              else if (l.length != null) {
                var h = Re(l, Le);
                Zr(s, h, l.length, -1), Pe(h);
              } else Te(s, "Wrong API use : tried to return a value of an unknown type (" + l + ").", -1);
              break;
            default:
              Kt(s);
          }
        }
        function t(s, l) {
          for (var h = [], p = 0; p < s; p += 1) {
            var d = z(l + 4 * p, "i32"), v = $r(d);
            if (v === 1 || v === 2) d = Xr(d);
            else if (v === 3) d = Hr(d);
            else if (v === 4) {
              v = d, d = Cr(v), v = Vr(v);
              for (var T = new Uint8Array(d), R = 0; R < d; R += 1) T[R] = N[v + R];
              d = T;
            } else d = null;
            h.push(d);
          }
          return h;
        }
        function r(s, l) {
          this.Qa = s, this.db = l, this.Oa = 1, this.lb = [];
        }
        function n(s, l) {
          if (this.db = l, l = fe(s) + 1, this.eb = at(l), this.eb === null) throw Error("Unable to allocate memory for the SQL string");
          F(s, y, this.eb, l), this.kb = this.eb, this.Za = this.pb = null;
        }
        function i(s) {
          if (this.filename = "dbfile_" + (4294967295 * Math.random() >>> 0), s != null) {
            var l = this.filename, h = "/", p = l;
            if (h && (h = typeof h == "string" ? h : Ge(h), p = l ? Ve(h + "/" + l) : h), l = kt(!0, !0), p = vr(p, l), s) {
              if (typeof s == "string") {
                h = Array(s.length);
                for (var d = 0, v = s.length; d < v; ++d) h[d] = s.charCodeAt(d);
                s = h;
              }
              Me(p, l | 146), h = oe(p, 577), Qt(h, s, 0, s.length, 0), rt(h), Me(p, l);
            }
          }
          this.handleError(c(this.filename, u)), this.db = z(u, "i32"), er(this.db), this.fb = {}, this.Sa = {};
        }
        var u = Y(4), a = o.cwrap, c = a("sqlite3_open", "number", ["string", "number"]), _ = a("sqlite3_close_v2", "number", ["number"]), b = a("sqlite3_exec", "number", ["number", "string", "number", "number", "number"]), A = a("sqlite3_changes", "number", ["number"]), x = a("sqlite3_prepare_v2", "number", ["number", "string", "number", "number", "number"]), Vt = a("sqlite3_sql", "string", ["number"]), Mr = a("sqlite3_normalized_sql", "string", ["number"]), Xt = a("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]), Sr = a("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]), Yt = a("sqlite3_bind_blob", "number", ["number", "number", "number", "number", "number"]), xr = a("sqlite3_bind_double", "number", ["number", "number", "number"]), Or = a(
          "sqlite3_bind_int",
          "number",
          ["number", "number", "number"]
        ), Lr = a("sqlite3_bind_parameter_index", "number", ["number", "string"]), Rr = a("sqlite3_step", "number", ["number"]), Pr = a("sqlite3_errmsg", "string", ["number"]), Tr = a("sqlite3_column_count", "number", ["number"]), Ur = a("sqlite3_data_count", "number", ["number"]), Dr = a("sqlite3_column_double", "number", ["number", "number"]), Gt = a("sqlite3_column_text", "string", ["number", "number"]), jr = a("sqlite3_column_blob", "number", ["number", "number"]), Wr = a("sqlite3_column_bytes", "number", [
          "number",
          "number"
        ]), zr = a("sqlite3_column_type", "number", ["number", "number"]), Fr = a("sqlite3_column_name", "string", ["number", "number"]), Ir = a("sqlite3_reset", "number", ["number"]), Qr = a("sqlite3_clear_bindings", "number", ["number"]), Br = a("sqlite3_finalize", "number", ["number"]), Zt = a("sqlite3_create_function_v2", "number", "number string number number number number number number number".split(" ")), $r = a("sqlite3_value_type", "number", ["number"]), Cr = a("sqlite3_value_bytes", "number", ["number"]), Hr = a(
          "sqlite3_value_text",
          "string",
          ["number"]
        ), Vr = a("sqlite3_value_blob", "number", ["number"]), Xr = a("sqlite3_value_double", "number", ["number"]), Yr = a("sqlite3_result_double", "", ["number", "number"]), Kt = a("sqlite3_result_null", "", ["number"]), Gr = a("sqlite3_result_text", "", ["number", "string", "number", "number"]), Zr = a("sqlite3_result_blob", "", ["number", "number", "number", "number"]), Kr = a("sqlite3_result_int", "", ["number", "number"]), Te = a("sqlite3_result_error", "", ["number", "string", "number"]), Jt = a(
          "sqlite3_aggregate_context",
          "number",
          ["number", "number"]
        ), er = a("RegisterExtensionFunctions", "number", ["number"]), tr = a("sqlite3_update_hook", "number", ["number", "number", "number"]);
        r.prototype.bind = function(s) {
          if (!this.Qa) throw "Statement closed";
          return this.reset(), Array.isArray(s) ? this.Cb(s) : s != null && typeof s == "object" ? this.Db(s) : !0;
        }, r.prototype.step = function() {
          if (!this.Qa) throw "Statement closed";
          this.Oa = 1;
          var s = Rr(this.Qa);
          switch (s) {
            case 100:
              return !0;
            case 101:
              return !1;
            default:
              throw this.db.handleError(s);
          }
        }, r.prototype.wb = function(s) {
          return s == null && (s = this.Oa, this.Oa += 1), Dr(this.Qa, s);
        }, r.prototype.Gb = function(s) {
          if (s == null && (s = this.Oa, this.Oa += 1), s = Gt(this.Qa, s), typeof BigInt != "function") throw Error("BigInt is not supported");
          return BigInt(s);
        }, r.prototype.Hb = function(s) {
          return s == null && (s = this.Oa, this.Oa += 1), Gt(this.Qa, s);
        }, r.prototype.getBlob = function(s) {
          s == null && (s = this.Oa, this.Oa += 1);
          var l = Wr(this.Qa, s);
          s = jr(this.Qa, s);
          for (var h = new Uint8Array(l), p = 0; p < l; p += 1) h[p] = N[s + p];
          return h;
        }, r.prototype.get = function(s, l) {
          l = l || {}, s != null && this.bind(s) && this.step(), s = [];
          for (var h = Ur(this.Qa), p = 0; p < h; p += 1) switch (zr(this.Qa, p)) {
            case 1:
              var d = l.useBigInt ? this.Gb(p) : this.wb(p);
              s.push(d);
              break;
            case 2:
              s.push(this.wb(p));
              break;
            case 3:
              s.push(this.Hb(p));
              break;
            case 4:
              s.push(this.getBlob(p));
              break;
            default:
              s.push(null);
          }
          return s;
        }, r.prototype.getColumnNames = function() {
          for (var s = [], l = Tr(this.Qa), h = 0; h < l; h += 1) s.push(Fr(this.Qa, h));
          return s;
        }, r.prototype.getAsObject = function(s, l) {
          s = this.get(s, l), l = this.getColumnNames();
          for (var h = {}, p = 0; p < l.length; p += 1) h[l[p]] = s[p];
          return h;
        }, r.prototype.getSQL = function() {
          return Vt(this.Qa);
        }, r.prototype.getNormalizedSQL = function() {
          return Mr(this.Qa);
        }, r.prototype.run = function(s) {
          return s != null && this.bind(s), this.step(), this.reset();
        }, r.prototype.sb = function(s, l) {
          l == null && (l = this.Oa, this.Oa += 1), s = Et(s);
          var h = Re(s, Le);
          this.lb.push(h), this.db.handleError(Sr(this.Qa, l, h, s.length - 1, 0));
        }, r.prototype.Bb = function(s, l) {
          l == null && (l = this.Oa, this.Oa += 1);
          var h = Re(s, Le);
          this.lb.push(h), this.db.handleError(Yt(
            this.Qa,
            l,
            h,
            s.length,
            0
          ));
        }, r.prototype.rb = function(s, l) {
          l == null && (l = this.Oa, this.Oa += 1), this.db.handleError((s === (s | 0) ? Or : xr)(this.Qa, l, s));
        }, r.prototype.Eb = function(s) {
          s == null && (s = this.Oa, this.Oa += 1), Yt(this.Qa, s, 0, 0, 0);
        }, r.prototype.tb = function(s, l) {
          switch (l == null && (l = this.Oa, this.Oa += 1), typeof s) {
            case "string":
              this.sb(s, l);
              return;
            case "number":
              this.rb(s, l);
              return;
            case "bigint":
              this.sb(s.toString(), l);
              return;
            case "boolean":
              this.rb(s + 0, l);
              return;
            case "object":
              if (s === null) {
                this.Eb(l);
                return;
              }
              if (s.length != null) {
                this.Bb(
                  s,
                  l
                );
                return;
              }
          }
          throw "Wrong API use : tried to bind a value of an unknown type (" + s + ").";
        }, r.prototype.Db = function(s) {
          var l = this;
          return Object.keys(s).forEach(function(h) {
            var p = Lr(l.Qa, h);
            p !== 0 && l.tb(s[h], p);
          }), !0;
        }, r.prototype.Cb = function(s) {
          for (var l = 0; l < s.length; l += 1) this.tb(s[l], l + 1);
          return !0;
        }, r.prototype.reset = function() {
          return this.freemem(), Qr(this.Qa) === 0 && Ir(this.Qa) === 0;
        }, r.prototype.freemem = function() {
          for (var s; (s = this.lb.pop()) !== void 0; ) Pe(s);
        }, r.prototype.free = function() {
          this.freemem();
          var s = Br(this.Qa) === 0;
          return delete this.db.fb[this.Qa], this.Qa = 0, s;
        }, n.prototype.next = function() {
          if (this.eb === null) return { done: !0 };
          if (this.Za !== null && (this.Za.free(), this.Za = null), !this.db.db) throw this.mb(), Error("Database closed");
          var s = de(), l = Y(4);
          le(u), le(l);
          try {
            this.db.handleError(Xt(this.db.db, this.kb, -1, u, l)), this.kb = z(l, "i32");
            var h = z(u, "i32");
            return h === 0 ? (this.mb(), { done: !0 }) : (this.Za = new r(h, this.db), this.db.fb[h] = this.Za, { value: this.Za, done: !1 });
          } catch (p) {
            throw this.pb = He(this.kb), this.mb(), p;
          } finally {
            pe(s);
          }
        }, n.prototype.mb = function() {
          Pe(this.eb), this.eb = null;
        }, n.prototype.getRemainingSQL = function() {
          return this.pb !== null ? this.pb : He(this.kb);
        }, typeof Symbol == "function" && typeof Symbol.iterator == "symbol" && (n.prototype[Symbol.iterator] = function() {
          return this;
        }), i.prototype.run = function(s, l) {
          if (!this.db) throw "Database closed";
          if (l) {
            s = this.prepare(s, l);
            try {
              s.step();
            } finally {
              s.free();
            }
          } else this.handleError(b(this.db, s, 0, 0, u));
          return this;
        }, i.prototype.exec = function(s, l, h) {
          if (!this.db) throw "Database closed";
          var p = de(), d = null;
          try {
            var v = st(s), T = Y(4);
            for (s = []; z(v, "i8") !== 0; ) {
              le(u), le(T), this.handleError(Xt(this.db, v, -1, u, T));
              var R = z(u, "i32");
              if (v = z(T, "i32"), R !== 0) {
                var O = null;
                for (d = new r(R, this), l != null && d.bind(l); d.step(); ) O === null && (O = { columns: d.getColumnNames(), values: [] }, s.push(O)), O.values.push(d.get(null, h));
                d.free();
              }
            }
            return s;
          } catch (U) {
            throw d && d.free(), U;
          } finally {
            pe(p);
          }
        }, i.prototype.each = function(s, l, h, p, d) {
          typeof l == "function" && (p = h, h = l, l = void 0), s = this.prepare(s, l);
          try {
            for (; s.step(); ) h(s.getAsObject(
              null,
              d
            ));
          } finally {
            s.free();
          }
          if (typeof p == "function") return p();
        }, i.prototype.prepare = function(s, l) {
          if (le(u), this.handleError(x(this.db, s, -1, u, 0)), s = z(u, "i32"), s === 0) throw "Nothing to prepare";
          var h = new r(s, this);
          return l != null && h.bind(l), this.fb[s] = h;
        }, i.prototype.iterateStatements = function(s) {
          return new n(s, this);
        }, i.prototype.export = function() {
          Object.values(this.fb).forEach(function(l) {
            l.free();
          }), Object.values(this.Sa).forEach(X), this.Sa = {}, this.handleError(_(this.db));
          var s = gr(this.filename);
          return this.handleError(c(
            this.filename,
            u
          )), this.db = z(u, "i32"), er(this.db), s;
        }, i.prototype.close = function() {
          this.db !== null && (Object.values(this.fb).forEach(function(s) {
            s.free();
          }), Object.values(this.Sa).forEach(X), this.Sa = {}, this.Ya && (X(this.Ya), this.Ya = void 0), this.handleError(_(this.db)), jt("/" + this.filename), this.db = null);
        }, i.prototype.handleError = function(s) {
          if (s === 0) return null;
          throw s = Pr(this.db), Error(s);
        }, i.prototype.getRowsModified = function() {
          return A(this.db);
        }, i.prototype.create_function = function(s, l) {
          Object.prototype.hasOwnProperty.call(
            this.Sa,
            s
          ) && (X(this.Sa[s]), delete this.Sa[s]);
          var h = me(function(p, d, v) {
            d = t(d, v);
            try {
              var T = l.apply(null, d);
            } catch (R) {
              Te(p, R, -1);
              return;
            }
            e(p, T);
          }, "viii");
          return this.Sa[s] = h, this.handleError(Zt(this.db, s, l.length, 1, 0, h, 0, 0, 0)), this;
        }, i.prototype.create_aggregate = function(s, l) {
          var h = l.init || function() {
            return null;
          }, p = l.finalize || function(O) {
            return O;
          }, d = l.step;
          if (!d) throw "An aggregate function must have a step function in " + s;
          var v = {};
          Object.hasOwnProperty.call(this.Sa, s) && (X(this.Sa[s]), delete this.Sa[s]), l = s + "__finalize", Object.hasOwnProperty.call(this.Sa, l) && (X(this.Sa[l]), delete this.Sa[l]);
          var T = me(function(O, U, ft) {
            var ee = Jt(O, 1);
            Object.hasOwnProperty.call(v, ee) || (v[ee] = h()), U = t(U, ft), U = [v[ee]].concat(U);
            try {
              v[ee] = d.apply(null, U);
            } catch (Jr) {
              delete v[ee], Te(O, Jr, -1);
            }
          }, "viii"), R = me(function(O) {
            var U = Jt(O, 1);
            try {
              var ft = p(v[U]);
            } catch (ee) {
              delete v[U], Te(O, ee, -1);
              return;
            }
            e(O, ft), delete v[U];
          }, "vi");
          return this.Sa[s] = T, this.Sa[l] = R, this.handleError(Zt(this.db, s, d.length - 1, 1, 0, 0, T, R, 0)), this;
        }, i.prototype.updateHook = function(s) {
          this.Ya && (tr(this.db, 0, 0), X(this.Ya), this.Ya = void 0), s && (this.Ya = me(function(l, h, p, d, v) {
            switch (h) {
              case 18:
                l = "insert";
                break;
              case 23:
                l = "update";
                break;
              case 9:
                l = "delete";
                break;
              default:
                throw "unknown operationCode in updateHook callback: " + h;
            }
            if (p = p ? q(y, p) : "", d = d ? q(y, d) : "", v > Number.MAX_SAFE_INTEGER) throw "rowId too big to fit inside a Number";
            s(l, p, d, Number(v));
          }, "viiiij"), tr(this.db, this.Ya, 0));
        }, o.Database = i;
      };
      var ct = { ...o }, je = "./this.program", be = (e, t) => {
        throw t;
      }, W = "", We, _e;
      if (we) {
        var ze = tn;
        W = __dirname + "/", _e = (e) => (e = Ee(e) ? new URL(e) : e, ze.readFileSync(e)), We = async (e) => (e = Ee(e) ? new URL(e) : e, ze.readFileSync(e, void 0)), !o.thisProgram && 1 < process.argv.length && (je = process.argv[1].replace(/\\/g, "/")), process.argv.slice(2), Q.exports = o, be = (e, t) => {
          throw process.exitCode = e, t;
        };
      } else (or || De) && (De ? W = self.location.href : typeof document < "u" && document.currentScript && (W = document.currentScript.src), W = W.startsWith("blob:") ? "" : W.slice(0, W.replace(/[?#].*/, "").lastIndexOf("/") + 1), De && (_e = (e) => {
        var t = new XMLHttpRequest();
        return t.open("GET", e, !1), t.responseType = "arraybuffer", t.send(null), new Uint8Array(t.response);
      }), We = async (e) => {
        if (Ee(e)) return new Promise((r, n) => {
          var i = new XMLHttpRequest();
          i.open("GET", e, !0), i.responseType = "arraybuffer", i.onload = () => {
            i.status == 200 || i.status == 0 && i.response ? r(i.response) : n(i.status);
          }, i.onerror = n, i.send(null);
        });
        var t = await fetch(e, { credentials: "same-origin" });
        if (t.ok) return t.arrayBuffer();
        throw Error(t.status + " : " + t.url);
      });
      var mt = o.print || console.log.bind(console), te = o.printErr || console.error.bind(console);
      Object.assign(o, ct), ct = null, o.thisProgram && (je = o.thisProgram);
      var ye = o.wasmBinary, ve, ge = !1, Fe, N, y, ue, g, k, Ie, P, Qe, Ee = (e) => e.startsWith("file://");
      function pt() {
        var e = ve.buffer;
        o.HEAP8 = N = new Int8Array(e), o.HEAP16 = ue = new Int16Array(e), o.HEAPU8 = y = new Uint8Array(e), o.HEAPU16 = new Uint16Array(e), o.HEAP32 = g = new Int32Array(e), o.HEAPU32 = k = new Uint32Array(e), o.HEAPF32 = Ie = new Float32Array(e), o.HEAPF64 = Qe = new Float64Array(e), o.HEAP64 = P = new BigInt64Array(e), o.HEAPU64 = new BigUint64Array(e);
      }
      var G = 0, ae = null;
      function re(e) {
        var t;
        throw (t = o.onAbort) == null || t.call(o, e), e = "Aborted(" + e + ")", te(e), ge = !0, new WebAssembly.RuntimeError(e + ". Build with -sASSERTIONS for more info.");
      }
      var Be;
      async function sr(e) {
        if (!ye) try {
          var t = await We(e);
          return new Uint8Array(t);
        } catch {
        }
        if (e == Be && ye) e = new Uint8Array(ye);
        else if (_e) e = _e(e);
        else throw "both async and sync fetching of the wasm failed";
        return e;
      }
      async function ur(e, t) {
        try {
          var r = await sr(e);
          return await WebAssembly.instantiate(r, t);
        } catch (n) {
          te(`failed to asynchronously prepare wasm: ${n}`), re(n);
        }
      }
      async function ar(e) {
        var t = Be;
        if (!ye && typeof WebAssembly.instantiateStreaming == "function" && !Ee(t) && !we) try {
          var r = fetch(t, { credentials: "same-origin" });
          return await WebAssembly.instantiateStreaming(r, e);
        } catch (n) {
          te(`wasm streaming compile failed: ${n}`), te("falling back to ArrayBuffer instantiation");
        }
        return ur(t, e);
      }
      class $e {
        name = "ExitStatus";
        constructor(t) {
          this.message = `Program terminated with exit(${t})`, this.status = t;
        }
      }
      var dt = (e) => {
        for (; 0 < e.length; ) e.shift()(o);
      }, wt = [], bt = [], lr = () => {
        var e = o.preRun.shift();
        bt.unshift(e);
      };
      function z(e, t = "i8") {
        switch (t.endsWith("*") && (t = "*"), t) {
          case "i1":
            return N[e];
          case "i8":
            return N[e];
          case "i16":
            return ue[e >> 1];
          case "i32":
            return g[e >> 2];
          case "i64":
            return P[e >> 3];
          case "float":
            return Ie[e >> 2];
          case "double":
            return Qe[e >> 3];
          case "*":
            return k[e >> 2];
          default:
            re(`invalid type for getValue: ${t}`);
        }
      }
      var Ce = o.noExitRuntime || !0;
      function le(e) {
        var t = "i32";
        switch (t.endsWith("*") && (t = "*"), t) {
          case "i1":
            N[e] = 0;
            break;
          case "i8":
            N[e] = 0;
            break;
          case "i16":
            ue[e >> 1] = 0;
            break;
          case "i32":
            g[e >> 2] = 0;
            break;
          case "i64":
            P[e >> 3] = BigInt(0);
            break;
          case "float":
            Ie[e >> 2] = 0;
            break;
          case "double":
            Qe[e >> 3] = 0;
            break;
          case "*":
            k[e >> 2] = 0;
            break;
          default:
            re(`invalid type for setValue: ${t}`);
        }
      }
      var _t = typeof TextDecoder < "u" ? new TextDecoder() : void 0, q = (e, t = 0, r = NaN) => {
        var n = t + r;
        for (r = t; e[r] && !(r >= n); ) ++r;
        if (16 < r - t && e.buffer && _t) return _t.decode(e.subarray(t, r));
        for (n = ""; t < r; ) {
          var i = e[t++];
          if (i & 128) {
            var u = e[t++] & 63;
            if ((i & 224) == 192) n += String.fromCharCode((i & 31) << 6 | u);
            else {
              var a = e[t++] & 63;
              i = (i & 240) == 224 ? (i & 15) << 12 | u << 6 | a : (i & 7) << 18 | u << 12 | a << 6 | e[t++] & 63, 65536 > i ? n += String.fromCharCode(i) : (i -= 65536, n += String.fromCharCode(55296 | i >> 10, 56320 | i & 1023));
            }
          } else n += String.fromCharCode(i);
        }
        return n;
      }, He = (e, t) => e ? q(y, e, t) : "", yt = (e, t) => {
        for (var r = 0, n = e.length - 1; 0 <= n; n--) {
          var i = e[n];
          i === "." ? e.splice(n, 1) : i === ".." ? (e.splice(n, 1), r++) : r && (e.splice(n, 1), r--);
        }
        if (t) for (; r; r--) e.unshift("..");
        return e;
      }, Ve = (e) => {
        var t = e.charAt(0) === "/", r = e.slice(-1) === "/";
        return (e = yt(e.split("/").filter((n) => !!n), !t).join("/")) || t || (e = "."), e && r && (e += "/"), (t ? "/" : "") + e;
      }, vt = (e) => {
        var t = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(e).slice(1);
        return e = t[0], t = t[1], !e && !t ? "." : (t &&= t.slice(0, -1), e + t);
      }, qe = (e) => e && e.match(/([^\/]+|\/)\/*$/)[1], fr = () => {
        if (we) {
          var e = rn;
          return (t) => e.randomFillSync(t);
        }
        return (t) => crypto.getRandomValues(t);
      }, gt = (e) => {
        (gt = fr())(e);
      }, hr = (...e) => {
        for (var t = "", r = !1, n = e.length - 1; -1 <= n && !r; n--) {
          if (r = 0 <= n ? e[n] : "/", typeof r != "string") throw new TypeError("Arguments to path.resolve must be strings");
          if (!r) return "";
          t = r + "/" + t, r = r.charAt(0) === "/";
        }
        return t = yt(t.split("/").filter((i) => !!i), !r).join("/"), (r ? "/" : "") + t || ".";
      }, Xe = [], fe = (e) => {
        for (var t = 0, r = 0; r < e.length; ++r) {
          var n = e.charCodeAt(r);
          127 >= n ? t++ : 2047 >= n ? t += 2 : 55296 <= n && 57343 >= n ? (t += 4, ++r) : t += 3;
        }
        return t;
      }, F = (e, t, r, n) => {
        if (!(0 < n)) return 0;
        var i = r;
        n = r + n - 1;
        for (var u = 0; u < e.length; ++u) {
          var a = e.charCodeAt(u);
          if (55296 <= a && 57343 >= a) {
            var c = e.charCodeAt(++u);
            a = 65536 + ((a & 1023) << 10) | c & 1023;
          }
          if (127 >= a) {
            if (r >= n) break;
            t[r++] = a;
          } else {
            if (2047 >= a) {
              if (r + 1 >= n) break;
              t[r++] = 192 | a >> 6;
            } else {
              if (65535 >= a) {
                if (r + 2 >= n) break;
                t[r++] = 224 | a >> 12;
              } else {
                if (r + 3 >= n) break;
                t[r++] = 240 | a >> 18, t[r++] = 128 | a >> 12 & 63;
              }
              t[r++] = 128 | a >> 6 & 63;
            }
            t[r++] = 128 | a & 63;
          }
        }
        return t[r] = 0, r - i;
      }, Et = (e, t) => {
        var r = Array(fe(e) + 1);
        return e = F(e, r, 0, r.length), t && (r.length = e), r;
      }, qt = [];
      function At(e, t) {
        qt[e] = { input: [], output: [], cb: t }, et(e, cr);
      }
      var cr = { open(e) {
        var t = qt[e.node.rdev];
        if (!t) throw new f(43);
        e.tty = t, e.seekable = !1;
      }, close(e) {
        e.tty.cb.fsync(e.tty);
      }, fsync(e) {
        e.tty.cb.fsync(e.tty);
      }, read(e, t, r, n) {
        if (!e.tty || !e.tty.cb.xb) throw new f(60);
        for (var i = 0, u = 0; u < n; u++) {
          try {
            var a = e.tty.cb.xb(e.tty);
          } catch {
            throw new f(29);
          }
          if (a === void 0 && i === 0) throw new f(6);
          if (a == null) break;
          i++, t[r + u] = a;
        }
        return i && (e.node.atime = Date.now()), i;
      }, write(e, t, r, n) {
        if (!e.tty || !e.tty.cb.qb) throw new f(60);
        try {
          for (var i = 0; i < n; i++) e.tty.cb.qb(e.tty, t[r + i]);
        } catch {
          throw new f(29);
        }
        return n && (e.node.mtime = e.node.ctime = Date.now()), i;
      } }, mr = { xb() {
        e: {
          if (!Xe.length) {
            var e = null;
            if (we) {
              var t = Buffer.alloc(256), r = 0, n = process.stdin.fd;
              try {
                r = ze.readSync(n, t, 0, 256);
              } catch (i) {
                if (i.toString().includes("EOF")) r = 0;
                else throw i;
              }
              0 < r && (e = t.slice(0, r).toString("utf-8"));
            } else typeof window < "u" && typeof window.prompt == "function" && (e = window.prompt("Input: "), e !== null && (e += `
`));
            if (!e) {
              e = null;
              break e;
            }
            Xe = Et(e, !0);
          }
          e = Xe.shift();
        }
        return e;
      }, qb(e, t) {
        t === null || t === 10 ? (mt(q(e.output)), e.output = []) : t != 0 && e.output.push(t);
      }, fsync(e) {
        var t;
        0 < ((t = e.output) == null ? void 0 : t.length) && (mt(q(e.output)), e.output = []);
      }, Tb() {
        return { Ob: 25856, Qb: 5, Nb: 191, Pb: 35387, Mb: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
      }, Ub() {
        return 0;
      }, Vb() {
        return [24, 80];
      } }, pr = { qb(e, t) {
        t === null || t === 10 ? (te(q(e.output)), e.output = []) : t != 0 && e.output.push(t);
      }, fsync(e) {
        var t;
        0 < ((t = e.output) == null ? void 0 : t.length) && (te(q(e.output)), e.output = []);
      } }, w = { Wa: null, Xa() {
        return w.createNode(null, "/", 16895, 0);
      }, createNode(e, t, r, n) {
        if ((r & 61440) === 24576 || (r & 61440) === 4096) throw new f(63);
        return w.Wa || (w.Wa = { dir: { node: { Ta: w.La.Ta, Ua: w.La.Ua, lookup: w.La.lookup, hb: w.La.hb, rename: w.La.rename, unlink: w.La.unlink, rmdir: w.La.rmdir, readdir: w.La.readdir, symlink: w.La.symlink }, stream: { Va: w.Ma.Va } }, file: { node: { Ta: w.La.Ta, Ua: w.La.Ua }, stream: { Va: w.Ma.Va, read: w.Ma.read, write: w.Ma.write, ib: w.Ma.ib, jb: w.Ma.jb } }, link: { node: { Ta: w.La.Ta, Ua: w.La.Ua, readlink: w.La.readlink }, stream: {} }, ub: { node: { Ta: w.La.Ta, Ua: w.La.Ua }, stream: yr } }), r = Ot(e, t, r, n), S(r.mode) ? (r.La = w.Wa.dir.node, r.Ma = w.Wa.dir.stream, r.Na = {}) : (r.mode & 61440) === 32768 ? (r.La = w.Wa.file.node, r.Ma = w.Wa.file.stream, r.Ra = 0, r.Na = null) : (r.mode & 61440) === 40960 ? (r.La = w.Wa.link.node, r.Ma = w.Wa.link.stream) : (r.mode & 61440) === 8192 && (r.La = w.Wa.ub.node, r.Ma = w.Wa.ub.stream), r.atime = r.mtime = r.ctime = Date.now(), e && (e.Na[t] = r, e.atime = e.mtime = e.ctime = r.atime), r;
      }, Sb(e) {
        return e.Na ? e.Na.subarray ? e.Na.subarray(0, e.Ra) : new Uint8Array(e.Na) : new Uint8Array(0);
      }, La: { Ta(e) {
        var t = {};
        return t.dev = (e.mode & 61440) === 8192 ? e.id : 1, t.ino = e.id, t.mode = e.mode, t.nlink = 1, t.uid = 0, t.gid = 0, t.rdev = e.rdev, S(e.mode) ? t.size = 4096 : (e.mode & 61440) === 32768 ? t.size = e.Ra : (e.mode & 61440) === 40960 ? t.size = e.link.length : t.size = 0, t.atime = new Date(e.atime), t.mtime = new Date(e.mtime), t.ctime = new Date(e.ctime), t.blksize = 4096, t.blocks = Math.ceil(t.size / t.blksize), t;
      }, Ua(e, t) {
        for (var r of ["mode", "atime", "mtime", "ctime"]) t[r] != null && (e[r] = t[r]);
        t.size !== void 0 && (t = t.size, e.Ra != t && (t == 0 ? (e.Na = null, e.Ra = 0) : (r = e.Na, e.Na = new Uint8Array(t), r && e.Na.set(r.subarray(0, Math.min(t, e.Ra))), e.Ra = t)));
      }, lookup() {
        throw w.vb;
      }, hb(e, t, r, n) {
        return w.createNode(e, t, r, n);
      }, rename(e, t, r) {
        try {
          var n = Z(t, r);
        } catch {
        }
        if (n) {
          if (S(e.mode)) for (var i in n.Na) throw new f(55);
          Ke(n);
        }
        delete e.parent.Na[e.name], t.Na[r] = e, e.name = r, t.ctime = t.mtime = e.parent.ctime = e.parent.mtime = Date.now();
      }, unlink(e, t) {
        delete e.Na[t], e.ctime = e.mtime = Date.now();
      }, rmdir(e, t) {
        var r = Z(e, t), n;
        for (n in r.Na) throw new f(55);
        delete e.Na[t], e.ctime = e.mtime = Date.now();
      }, readdir(e) {
        return [".", "..", ...Object.keys(e.Na)];
      }, symlink(e, t, r) {
        return e = w.createNode(e, t, 41471, 0), e.link = r, e;
      }, readlink(e) {
        if ((e.mode & 61440) !== 40960) throw new f(28);
        return e.link;
      } }, Ma: { read(e, t, r, n, i) {
        var u = e.node.Na;
        if (i >= e.node.Ra) return 0;
        if (e = Math.min(e.node.Ra - i, n), 8 < e && u.subarray) t.set(u.subarray(i, i + e), r);
        else for (n = 0; n < e; n++) t[r + n] = u[i + n];
        return e;
      }, write(e, t, r, n, i, u) {
        if (t.buffer === N.buffer && (u = !1), !n) return 0;
        if (e = e.node, e.mtime = e.ctime = Date.now(), t.subarray && (!e.Na || e.Na.subarray)) {
          if (u) return e.Na = t.subarray(r, r + n), e.Ra = n;
          if (e.Ra === 0 && i === 0) return e.Na = t.slice(r, r + n), e.Ra = n;
          if (i + n <= e.Ra) return e.Na.set(t.subarray(
            r,
            r + n
          ), i), n;
        }
        u = i + n;
        var a = e.Na ? e.Na.length : 0;
        if (a >= u || (u = Math.max(u, a * (1048576 > a ? 2 : 1.125) >>> 0), a != 0 && (u = Math.max(u, 256)), a = e.Na, e.Na = new Uint8Array(u), 0 < e.Ra && e.Na.set(a.subarray(0, e.Ra), 0)), e.Na.subarray && t.subarray) e.Na.set(t.subarray(r, r + n), i);
        else for (u = 0; u < n; u++) e.Na[i + u] = t[r + u];
        return e.Ra = Math.max(e.Ra, i + n), n;
      }, Va(e, t, r) {
        if (r === 1 ? t += e.position : r === 2 && (e.node.mode & 61440) === 32768 && (t += e.node.Ra), 0 > t) throw new f(28);
        return t;
      }, ib(e, t, r, n, i) {
        if ((e.node.mode & 61440) !== 32768) throw new f(43);
        if (e = e.node.Na, i & 2 || !e || e.buffer !== N.buffer) {
          i = !0, n = 65536 * Math.ceil(t / 65536);
          var u = Ct(65536, n);
          if (u && y.fill(0, u, u + n), n = u, !n) throw new f(48);
          e && ((0 < r || r + t < e.length) && (e.subarray ? e = e.subarray(r, r + t) : e = Array.prototype.slice.call(e, r, r + t)), N.set(e, n));
        } else i = !1, n = e.byteOffset;
        return { Kb: n, Ab: i };
      }, jb(e, t, r, n) {
        return w.Ma.write(e, t, 0, n, r, !1), 0;
      } } }, kt = (e, t) => {
        var r = 0;
        return e && (r |= 365), t && (r |= 146), r;
      }, Ye = null, Nt = {}, ne = [], dr = 1, H = null, Mt = !1, St = !0, xt = {}, f = class {
        name = "ErrnoError";
        constructor(e) {
          this.Pa = e;
        }
      }, wr = class {
        gb = {};
        node = null;
        get flags() {
          return this.gb.flags;
        }
        set flags(e) {
          this.gb.flags = e;
        }
        get position() {
          return this.gb.position;
        }
        set position(e) {
          this.gb.position = e;
        }
      }, br = class {
        La = {};
        Ma = {};
        ab = null;
        constructor(e, t, r, n) {
          e ||= this, this.parent = e, this.Xa = e.Xa, this.id = dr++, this.name = t, this.mode = r, this.rdev = n, this.atime = this.mtime = this.ctime = Date.now();
        }
        get read() {
          return (this.mode & 365) === 365;
        }
        set read(e) {
          e ? this.mode |= 365 : this.mode &= -366;
        }
        get write() {
          return (this.mode & 146) === 146;
        }
        set write(e) {
          e ? this.mode |= 146 : this.mode &= -147;
        }
      };
      function L(e, t = {}) {
        if (!e) throw new f(44);
        t.nb ?? (t.nb = !0), e.charAt(0) === "/" || (e = "//" + e);
        var r = 0;
        e: for (; 40 > r; r++) {
          e = e.split("/").filter((c) => !!c);
          for (var n = Ye, i = "/", u = 0; u < e.length; u++) {
            var a = u === e.length - 1;
            if (a && t.parent) break;
            if (e[u] !== ".") if (e[u] === "..") i = vt(i), n = n.parent;
            else {
              i = Ve(i + "/" + e[u]);
              try {
                n = Z(n, e[u]);
              } catch (c) {
                if ((c == null ? void 0 : c.Pa) === 44 && a && t.Jb) return { path: i };
                throw c;
              }
              if (!n.ab || a && !t.nb || (n = n.ab.root), (n.mode & 61440) === 40960 && (!a || t.$a)) {
                if (!n.La.readlink) throw new f(52);
                n = n.La.readlink(n), n.charAt(0) === "/" || (n = vt(i) + "/" + n), e = n + "/" + e.slice(u + 1).join("/");
                continue e;
              }
            }
          }
          return { path: i, node: n };
        }
        throw new f(32);
      }
      function Ge(e) {
        for (var t; ; ) {
          if (e === e.parent) return e = e.Xa.zb, t ? e[e.length - 1] !== "/" ? `${e}/${t}` : e + t : e;
          t = t ? `${e.name}/${t}` : e.name, e = e.parent;
        }
      }
      function Ze(e, t) {
        for (var r = 0, n = 0; n < t.length; n++) r = (r << 5) - r + t.charCodeAt(n) | 0;
        return (e + r >>> 0) % H.length;
      }
      function Ke(e) {
        var t = Ze(e.parent.id, e.name);
        if (H[t] === e) H[t] = e.bb;
        else for (t = H[t]; t; ) {
          if (t.bb === e) {
            t.bb = e.bb;
            break;
          }
          t = t.bb;
        }
      }
      function Z(e, t) {
        var r = S(e.mode) ? (r = ie(e, "x")) ? r : e.La.lookup ? 0 : 2 : 54;
        if (r) throw new f(r);
        for (r = H[Ze(e.id, t)]; r; r = r.bb) {
          var n = r.name;
          if (r.parent.id === e.id && n === t) return r;
        }
        return e.La.lookup(e, t);
      }
      function Ot(e, t, r, n) {
        return e = new br(e, t, r, n), t = Ze(e.parent.id, e.name), e.bb = H[t], H[t] = e;
      }
      function S(e) {
        return (e & 61440) === 16384;
      }
      function Lt(e) {
        var t = ["r", "w", "rw"][e & 3];
        return e & 512 && (t += "w"), t;
      }
      function ie(e, t) {
        if (St) return 0;
        if (!t.includes("r") || e.mode & 292) {
          if (t.includes("w") && !(e.mode & 146) || t.includes("x") && !(e.mode & 73)) return 2;
        } else return 2;
        return 0;
      }
      function Rt(e, t) {
        if (!S(e.mode)) return 54;
        try {
          return Z(e, t), 20;
        } catch {
        }
        return ie(e, "wx");
      }
      function Pt(e, t, r) {
        try {
          var n = Z(e, t);
        } catch (i) {
          return i.Pa;
        }
        if (e = ie(e, "wx")) return e;
        if (r) {
          if (!S(n.mode)) return 54;
          if (n === n.parent || Ge(n) === "/") return 10;
        } else if (S(n.mode)) return 31;
        return 0;
      }
      function Ae(e) {
        if (!e) throw new f(63);
        return e;
      }
      function M(e) {
        if (e = ne[e], !e) throw new f(8);
        return e;
      }
      function Tt(e, t = -1) {
        if (e = Object.assign(new wr(), e), t == -1) e: {
          for (t = 0; 4096 >= t; t++) if (!ne[t]) break e;
          throw new f(33);
        }
        return e.fd = t, ne[t] = e;
      }
      function _r(e, t = -1) {
        var r, n;
        return e = Tt(e, t), (n = (r = e.Ma) == null ? void 0 : r.Rb) == null || n.call(r, e), e;
      }
      function Je(e, t, r) {
        var n = e == null ? void 0 : e.Ma.Ua;
        e = n ? e : t, n ??= t.La.Ua, Ae(n), n(e, r);
      }
      var yr = { open(e) {
        var t, r;
        e.Ma = Nt[e.node.rdev].Ma, (r = (t = e.Ma).open) == null || r.call(t, e);
      }, Va() {
        throw new f(70);
      } };
      function et(e, t) {
        Nt[e] = { Ma: t };
      }
      function Ut(e, t) {
        var r = t === "/";
        if (r && Ye) throw new f(10);
        if (!r && t) {
          var n = L(t, { nb: !1 });
          if (t = n.path, n = n.node, n.ab) throw new f(10);
          if (!S(n.mode)) throw new f(54);
        }
        t = { type: e, Wb: {}, zb: t, Ib: [] }, e = e.Xa(t), e.Xa = t, t.root = e, r ? Ye = e : n && (n.ab = t, n.Xa && n.Xa.Ib.push(t));
      }
      function ke(e, t, r) {
        var n = L(e, { parent: !0 }).node;
        if (e = qe(e), !e) throw new f(28);
        if (e === "." || e === "..") throw new f(20);
        var i = Rt(n, e);
        if (i) throw new f(i);
        if (!n.La.hb) throw new f(63);
        return n.La.hb(n, e, t, r);
      }
      function vr(e, t = 438) {
        return ke(e, t & 4095 | 32768, 0);
      }
      function D(e, t = 511) {
        return ke(e, t & 1023 | 16384, 0);
      }
      function Ne(e, t, r) {
        typeof r > "u" && (r = t, t = 438), ke(e, t | 8192, r);
      }
      function tt(e, t) {
        if (!hr(e)) throw new f(44);
        var r = L(t, { parent: !0 }).node;
        if (!r) throw new f(44);
        t = qe(t);
        var n = Rt(r, t);
        if (n) throw new f(n);
        if (!r.La.symlink) throw new f(63);
        r.La.symlink(r, t, e);
      }
      function Dt(e) {
        var t = L(e, { parent: !0 }).node;
        e = qe(e);
        var r = Z(t, e), n = Pt(t, e, !0);
        if (n) throw new f(n);
        if (!t.La.rmdir) throw new f(63);
        if (r.ab) throw new f(10);
        t.La.rmdir(t, e), Ke(r);
      }
      function jt(e) {
        var t = L(e, { parent: !0 }).node;
        if (!t) throw new f(44);
        e = qe(e);
        var r = Z(t, e), n = Pt(t, e, !1);
        if (n) throw new f(n);
        if (!t.La.unlink) throw new f(63);
        if (r.ab) throw new f(10);
        t.La.unlink(t, e), Ke(r);
      }
      function he(e, t) {
        return e = L(e, { $a: !t }).node, Ae(e.La.Ta)(e);
      }
      function Wt(e, t, r, n) {
        Je(e, t, { mode: r & 4095 | t.mode & -4096, ctime: Date.now(), Fb: n });
      }
      function Me(e, t) {
        e = typeof e == "string" ? L(e, { $a: !0 }).node : e, Wt(null, e, t);
      }
      function zt(e, t, r) {
        if (S(t.mode)) throw new f(31);
        if ((t.mode & 61440) !== 32768) throw new f(28);
        var n = ie(t, "w");
        if (n) throw new f(n);
        Je(e, t, { size: r, timestamp: Date.now() });
      }
      function oe(e, t, r = 438) {
        if (e === "") throw new f(44);
        if (typeof t == "string") {
          var n = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[t];
          if (typeof n > "u") throw Error(`Unknown file open mode: ${t}`);
          t = n;
        }
        if (r = t & 64 ? r & 4095 | 32768 : 0, typeof e == "object") n = e;
        else {
          var i = e.endsWith("/");
          e = L(e, { $a: !(t & 131072), Jb: !0 }), n = e.node, e = e.path;
        }
        var u = !1;
        if (t & 64) if (n) {
          if (t & 128) throw new f(20);
        } else {
          if (i) throw new f(31);
          n = ke(e, r | 511, 0), u = !0;
        }
        if (!n) throw new f(44);
        if ((n.mode & 61440) === 8192 && (t &= -513), t & 65536 && !S(n.mode)) throw new f(54);
        if (!u && (i = n ? (n.mode & 61440) === 40960 ? 32 : S(n.mode) && (Lt(t) !== "r" || t & 576) ? 31 : ie(n, Lt(t)) : 44)) throw new f(i);
        return t & 512 && !u && (i = n, i = typeof i == "string" ? L(i, { $a: !0 }).node : i, zt(null, i, 0)), t &= -131713, i = Tt({ node: n, path: Ge(n), flags: t, seekable: !0, position: 0, Ma: n.Ma, Lb: [], error: !1 }), i.Ma.open && i.Ma.open(i), u && Me(n, r & 511), !o.logReadFiles || t & 1 || e in xt || (xt[e] = 1), i;
      }
      function rt(e) {
        if (e.fd === null) throw new f(8);
        e.ob && (e.ob = null);
        try {
          e.Ma.close && e.Ma.close(e);
        } catch (t) {
          throw t;
        } finally {
          ne[e.fd] = null;
        }
        e.fd = null;
      }
      function Ft(e, t, r) {
        if (e.fd === null) throw new f(8);
        if (!e.seekable || !e.Ma.Va) throw new f(70);
        if (r != 0 && r != 1 && r != 2) throw new f(28);
        e.position = e.Ma.Va(e, t, r), e.Lb = [];
      }
      function It(e, t, r, n, i) {
        if (0 > n || 0 > i) throw new f(28);
        if (e.fd === null) throw new f(8);
        if ((e.flags & 2097155) === 1) throw new f(8);
        if (S(e.node.mode)) throw new f(31);
        if (!e.Ma.read) throw new f(28);
        var u = typeof i < "u";
        if (!u) i = e.position;
        else if (!e.seekable) throw new f(70);
        return t = e.Ma.read(e, t, r, n, i), u || (e.position += t), t;
      }
      function Qt(e, t, r, n, i) {
        if (0 > n || 0 > i) throw new f(28);
        if (e.fd === null) throw new f(8);
        if (!(e.flags & 2097155)) throw new f(8);
        if (S(e.node.mode)) throw new f(31);
        if (!e.Ma.write) throw new f(28);
        e.seekable && e.flags & 1024 && Ft(e, 0, 2);
        var u = typeof i < "u";
        if (!u) i = e.position;
        else if (!e.seekable) throw new f(70);
        return t = e.Ma.write(e, t, r, n, i, void 0), u || (e.position += t), t;
      }
      function gr(e) {
        var t, r = oe(e, r || 0);
        e = he(e).size;
        var n = new Uint8Array(e);
        return It(r, n, 0, e, 0), t = n, rt(r), t;
      }
      function V(e, t, r) {
        e = Ve("/dev/" + e);
        var n = kt(!!t, !!r);
        V.yb ?? (V.yb = 64);
        var i = V.yb++ << 8 | 0;
        et(i, { open(u) {
          u.seekable = !1;
        }, close() {
          var u;
          (u = r == null ? void 0 : r.buffer) != null && u.length && r(10);
        }, read(u, a, c, _) {
          for (var b = 0, A = 0; A < _; A++) {
            try {
              var x = t();
            } catch {
              throw new f(29);
            }
            if (x === void 0 && b === 0) throw new f(6);
            if (x == null) break;
            b++, a[c + A] = x;
          }
          return b && (u.node.atime = Date.now()), b;
        }, write(u, a, c, _) {
          for (var b = 0; b < _; b++) try {
            r(a[c + b]);
          } catch {
            throw new f(29);
          }
          return _ && (u.node.mtime = u.node.ctime = Date.now()), b;
        } }), Ne(e, n, i);
      }
      var E = {};
      function K(e, t, r) {
        if (t.charAt(0) === "/") return t;
        if (e = e === -100 ? "/" : M(e).path, t.length == 0) {
          if (!r) throw new f(44);
          return e;
        }
        return e + "/" + t;
      }
      function Se(e, t) {
        g[e >> 2] = t.dev, g[e + 4 >> 2] = t.mode, k[e + 8 >> 2] = t.nlink, g[e + 12 >> 2] = t.uid, g[e + 16 >> 2] = t.gid, g[e + 20 >> 2] = t.rdev, P[e + 24 >> 3] = BigInt(t.size), g[e + 32 >> 2] = 4096, g[e + 36 >> 2] = t.blocks;
        var r = t.atime.getTime(), n = t.mtime.getTime(), i = t.ctime.getTime();
        return P[e + 40 >> 3] = BigInt(Math.floor(r / 1e3)), k[e + 48 >> 2] = r % 1e3 * 1e6, P[e + 56 >> 3] = BigInt(Math.floor(n / 1e3)), k[e + 64 >> 2] = n % 1e3 * 1e6, P[e + 72 >> 3] = BigInt(Math.floor(i / 1e3)), k[e + 80 >> 2] = i % 1e3 * 1e6, P[e + 88 >> 3] = BigInt(t.ino), 0;
      }
      var xe = void 0, Oe = () => {
        var e = g[+xe >> 2];
        return xe += 4, e;
      }, nt = 0, Er = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], qr = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], ce = {}, Bt = (e) => {
        var t;
        Fe = e, Ce || 0 < nt || ((t = o.onExit) == null || t.call(o, e), ge = !0), be(e, new $e(e));
      }, Ar = (e) => {
        if (!ge) try {
          if (e(), !(Ce || 0 < nt)) try {
            Fe = e = Fe, Bt(e);
          } catch (t) {
            t instanceof $e || t == "unwind" || be(1, t);
          }
        } catch (t) {
          t instanceof $e || t == "unwind" || be(1, t);
        }
      }, it = {}, $t = () => {
        if (!ot) {
          var e = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: je || "./this.program" }, t;
          for (t in it) it[t] === void 0 ? delete e[t] : e[t] = it[t];
          var r = [];
          for (t in e) r.push(`${t}=${e[t]}`);
          ot = r;
        }
        return ot;
      }, ot, st = (e) => {
        var t = fe(e) + 1, r = Y(t);
        return F(e, y, r, t), r;
      }, kr = (e, t, r, n) => {
        var i = { string: (b) => {
          var A = 0;
          return b != null && b !== 0 && (A = st(b)), A;
        }, array: (b) => {
          var A = Y(b.length);
          return N.set(b, A), A;
        } };
        e = o["_" + e];
        var u = [], a = 0;
        if (n) for (var c = 0; c < n.length; c++) {
          var _ = i[r[c]];
          _ ? (a === 0 && (a = de()), u[c] = _(n[c])) : u[c] = n[c];
        }
        return r = e(...u), r = function(b) {
          return a !== 0 && pe(a), t === "string" ? b ? q(y, b) : "" : t === "boolean" ? !!b : b;
        }(r);
      }, Le = 0, Re = (e, t) => (t = t == 1 ? Y(e.length) : at(e.length), e.subarray || e.slice || (e = new Uint8Array(e)), y.set(e, t), t), J, ut = [], I, X = (e) => {
        J.delete(I.get(e)), I.set(e, null), ut.push(e);
      }, me = (e, t) => {
        if (!J) {
          J = /* @__PURE__ */ new WeakMap();
          var r = I.length;
          if (J) for (var n = 0; n < 0 + r; n++) {
            var i = I.get(n);
            i && J.set(i, n);
          }
        }
        if (r = J.get(e) || 0) return r;
        if (ut.length) r = ut.pop();
        else {
          try {
            I.grow(1);
          } catch (_) {
            throw _ instanceof RangeError ? "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH." : _;
          }
          r = I.length - 1;
        }
        try {
          I.set(r, e);
        } catch (_) {
          if (!(_ instanceof TypeError)) throw _;
          if (typeof WebAssembly.Function == "function") {
            var u = WebAssembly.Function;
            n = { i: "i32", j: "i64", f: "f32", d: "f64", e: "externref", p: "i32" }, i = { parameters: [], results: t[0] == "v" ? [] : [n[t[0]]] };
            for (var a = 1; a < t.length; ++a) i.parameters.push(n[t[a]]);
            t = new u(i, e);
          } else {
            n = [1], i = t.slice(0, 1), t = t.slice(1), a = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 }, n.push(96);
            var c = t.length;
            128 > c ? n.push(c) : n.push(c % 128 | 128, c >> 7);
            for (u of t) n.push(a[u]);
            i == "v" ? n.push(0) : n.push(1, a[i]), t = [0, 97, 115, 109, 1, 0, 0, 0, 1], u = n.length, 128 > u ? t.push(u) : t.push(u % 128 | 128, u >> 7), t.push(...n), t.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0), t = new WebAssembly.Module(new Uint8Array(t)), t = new WebAssembly.Instance(t, { e: { f: e } }).exports.f;
          }
          I.set(r, t);
        }
        return J.set(e, r), r;
      };
      H = Array(4096), Ut(w, "/"), D("/tmp"), D("/home"), D("/home/web_user"), function() {
        D("/dev"), et(259, { read: () => 0, write: (n, i, u, a) => a, Va: () => 0 }), Ne("/dev/null", 259), At(1280, mr), At(1536, pr), Ne("/dev/tty", 1280), Ne("/dev/tty1", 1536);
        var e = new Uint8Array(1024), t = 0, r = () => (t === 0 && (gt(e), t = e.byteLength), e[--t]);
        V("random", r), V("urandom", r), D("/dev/shm"), D("/dev/shm/tmp");
      }(), function() {
        D("/proc");
        var e = D("/proc/self");
        D("/proc/self/fd"), Ut({ Xa() {
          var t = Ot(e, "fd", 16895, 73);
          return t.Ma = { Va: w.Ma.Va }, t.La = { lookup(r, n) {
            r = +n;
            var i = M(r);
            return r = { parent: null, Xa: { zb: "fake" }, La: { readlink: () => i.path }, id: r + 1 }, r.parent = r;
          }, readdir() {
            return Array.from(ne.entries()).filter(([, r]) => r).map(([r]) => r.toString());
          } }, t;
        } }, "/proc/self/fd");
      }(), w.vb = new f(44), w.vb.stack = "<generic error, no stack>";
      var Nr = { a: (e, t, r, n) => re(`Assertion failed: ${e ? q(y, e) : ""}, at: ` + [t ? t ? q(y, t) : "" : "unknown filename", r, n ? n ? q(y, n) : "" : "unknown function"]), i: function(e, t) {
        try {
          return e = e ? q(y, e) : "", Me(e, t), 0;
        } catch (r) {
          if (typeof E > "u" || r.name !== "ErrnoError") throw r;
          return -r.Pa;
        }
      }, L: function(e, t, r) {
        try {
          if (t = t ? q(y, t) : "", t = K(e, t), r & -8) return -28;
          var n = L(t, { $a: !0 }).node;
          return n ? (e = "", r & 4 && (e += "r"), r & 2 && (e += "w"), r & 1 && (e += "x"), e && ie(n, e) ? -2 : 0) : -44;
        } catch (i) {
          if (typeof E > "u" || i.name !== "ErrnoError") throw i;
          return -i.Pa;
        }
      }, j: function(e, t) {
        try {
          var r = M(e);
          return Wt(r, r.node, t, !1), 0;
        } catch (n) {
          if (typeof E > "u" || n.name !== "ErrnoError") throw n;
          return -n.Pa;
        }
      }, h: function(e) {
        try {
          var t = M(e);
          return Je(t, t.node, { timestamp: Date.now(), Fb: !1 }), 0;
        } catch (r) {
          if (typeof E > "u" || r.name !== "ErrnoError") throw r;
          return -r.Pa;
        }
      }, b: function(e, t, r) {
        xe = r;
        try {
          var n = M(e);
          switch (t) {
            case 0:
              var i = Oe();
              if (0 > i) break;
              for (; ne[i]; ) i++;
              return _r(n, i).fd;
            case 1:
            case 2:
              return 0;
            case 3:
              return n.flags;
            case 4:
              return i = Oe(), n.flags |= i, 0;
            case 12:
              return i = Oe(), ue[i + 0 >> 1] = 2, 0;
            case 13:
            case 14:
              return 0;
          }
          return -28;
        } catch (u) {
          if (typeof E > "u" || u.name !== "ErrnoError") throw u;
          return -u.Pa;
        }
      }, g: function(e, t) {
        try {
          var r = M(e), n = r.node, i = r.Ma.Ta;
          e = i ? r : n, i ??= n.La.Ta, Ae(i);
          var u = i(e);
          return Se(t, u);
        } catch (a) {
          if (typeof E > "u" || a.name !== "ErrnoError") throw a;
          return -a.Pa;
        }
      }, H: function(e, t) {
        t = -9007199254740992 > t || 9007199254740992 < t ? NaN : Number(t);
        try {
          if (isNaN(t)) return 61;
          var r = M(e);
          if (0 > t || !(r.flags & 2097155)) throw new f(28);
          return zt(r, r.node, t), 0;
        } catch (n) {
          if (typeof E > "u" || n.name !== "ErrnoError") throw n;
          return -n.Pa;
        }
      }, G: function(e, t) {
        try {
          if (t === 0) return -28;
          var r = fe("/") + 1;
          return t < r ? -68 : (F("/", y, e, t), r);
        } catch (n) {
          if (typeof E > "u" || n.name !== "ErrnoError") throw n;
          return -n.Pa;
        }
      }, K: function(e, t) {
        try {
          return e = e ? q(y, e) : "", Se(t, he(e, !0));
        } catch (r) {
          if (typeof E > "u" || r.name !== "ErrnoError") throw r;
          return -r.Pa;
        }
      }, C: function(e, t, r) {
        try {
          return t = t ? q(y, t) : "", t = K(e, t), D(t, r), 0;
        } catch (n) {
          if (typeof E > "u" || n.name !== "ErrnoError") throw n;
          return -n.Pa;
        }
      }, J: function(e, t, r, n) {
        try {
          t = t ? q(y, t) : "";
          var i = n & 256;
          return t = K(e, t, n & 4096), Se(r, i ? he(t, !0) : he(t));
        } catch (u) {
          if (typeof E > "u" || u.name !== "ErrnoError") throw u;
          return -u.Pa;
        }
      }, x: function(e, t, r, n) {
        xe = n;
        try {
          t = t ? q(y, t) : "", t = K(e, t);
          var i = n ? Oe() : 0;
          return oe(t, r, i).fd;
        } catch (u) {
          if (typeof E > "u" || u.name !== "ErrnoError") throw u;
          return -u.Pa;
        }
      }, v: function(e, t, r, n) {
        try {
          if (t = t ? q(y, t) : "", t = K(e, t), 0 >= n) return -28;
          var i = L(t).node;
          if (!i) throw new f(44);
          if (!i.La.readlink) throw new f(28);
          var u = i.La.readlink(i), a = Math.min(n, fe(u)), c = N[r + a];
          return F(u, y, r, n + 1), N[r + a] = c, a;
        } catch (_) {
          if (typeof E > "u" || _.name !== "ErrnoError") throw _;
          return -_.Pa;
        }
      }, u: function(e) {
        try {
          return e = e ? q(y, e) : "", Dt(e), 0;
        } catch (t) {
          if (typeof E > "u" || t.name !== "ErrnoError") throw t;
          return -t.Pa;
        }
      }, f: function(e, t) {
        try {
          return e = e ? q(y, e) : "", Se(t, he(e));
        } catch (r) {
          if (typeof E > "u" || r.name !== "ErrnoError") throw r;
          return -r.Pa;
        }
      }, r: function(e, t, r) {
        try {
          return t = t ? q(y, t) : "", t = K(e, t), r === 0 ? jt(t) : r === 512 ? Dt(t) : re("Invalid flags passed to unlinkat"), 0;
        } catch (n) {
          if (typeof E > "u" || n.name !== "ErrnoError") throw n;
          return -n.Pa;
        }
      }, q: function(e, t, r) {
        try {
          t = t ? q(y, t) : "", t = K(e, t, !0);
          var n = Date.now(), i, u;
          if (r) {
            var a = k[r >> 2] + 4294967296 * g[r + 4 >> 2], c = g[r + 8 >> 2];
            c == 1073741823 ? i = n : c == 1073741822 ? i = null : i = 1e3 * a + c / 1e6, r += 16, a = k[r >> 2] + 4294967296 * g[r + 4 >> 2], c = g[r + 8 >> 2], c == 1073741823 ? u = n : c == 1073741822 ? u = null : u = 1e3 * a + c / 1e6;
          } else u = i = n;
          if ((u ?? i) !== null) {
            e = i;
            var _ = L(t, { $a: !0 }).node;
            Ae(_.La.Ua)(_, { atime: e, mtime: u });
          }
          return 0;
        } catch (b) {
          if (typeof E > "u" || b.name !== "ErrnoError") throw b;
          return -b.Pa;
        }
      }, m: () => re(""), l: () => {
        Ce = !1, nt = 0;
      }, A: function(e, t) {
        e = -9007199254740992 > e || 9007199254740992 < e ? NaN : Number(e), e = new Date(1e3 * e), g[t >> 2] = e.getSeconds(), g[t + 4 >> 2] = e.getMinutes(), g[t + 8 >> 2] = e.getHours(), g[t + 12 >> 2] = e.getDate(), g[t + 16 >> 2] = e.getMonth(), g[t + 20 >> 2] = e.getFullYear() - 1900, g[t + 24 >> 2] = e.getDay();
        var r = e.getFullYear();
        g[t + 28 >> 2] = (r % 4 !== 0 || r % 100 === 0 && r % 400 !== 0 ? qr : Er)[e.getMonth()] + e.getDate() - 1 | 0, g[t + 36 >> 2] = -(60 * e.getTimezoneOffset()), r = new Date(
          e.getFullYear(),
          6,
          1
        ).getTimezoneOffset();
        var n = new Date(e.getFullYear(), 0, 1).getTimezoneOffset();
        g[t + 32 >> 2] = (r != n && e.getTimezoneOffset() == Math.min(n, r)) | 0;
      }, y: function(e, t, r, n, i, u, a) {
        i = -9007199254740992 > i || 9007199254740992 < i ? NaN : Number(i);
        try {
          if (isNaN(i)) return 61;
          var c = M(n);
          if (t & 2 && !(r & 2) && (c.flags & 2097155) !== 2) throw new f(2);
          if ((c.flags & 2097155) === 1) throw new f(2);
          if (!c.Ma.ib) throw new f(43);
          if (!e) throw new f(28);
          var _ = c.Ma.ib(c, e, i, t, r), b = _.Kb;
          return g[u >> 2] = _.Ab, k[a >> 2] = b, 0;
        } catch (A) {
          if (typeof E > "u" || A.name !== "ErrnoError") throw A;
          return -A.Pa;
        }
      }, z: function(e, t, r, n, i, u) {
        u = -9007199254740992 > u || 9007199254740992 < u ? NaN : Number(u);
        try {
          var a = M(i);
          if (r & 2) {
            if (r = u, (a.node.mode & 61440) !== 32768) throw new f(43);
            if (!(n & 2)) {
              var c = y.slice(e, e + t);
              a.Ma.jb && a.Ma.jb(a, c, r, t, n);
            }
          }
        } catch (_) {
          if (typeof E > "u" || _.name !== "ErrnoError") throw _;
          return -_.Pa;
        }
      }, n: (e, t) => {
        if (ce[e] && (clearTimeout(ce[e].id), delete ce[e]), !t) return 0;
        var r = setTimeout(() => {
          delete ce[e], Ar(() => Ht(e, performance.now()));
        }, t);
        return ce[e] = {
          id: r,
          Xb: t
        }, 0;
      }, B: (e, t, r, n) => {
        var i = (/* @__PURE__ */ new Date()).getFullYear(), u = new Date(i, 0, 1).getTimezoneOffset();
        i = new Date(i, 6, 1).getTimezoneOffset(), k[e >> 2] = 60 * Math.max(u, i), g[t >> 2] = +(u != i), t = (a) => {
          var c = Math.abs(a);
          return `UTC${0 <= a ? "-" : "+"}${String(Math.floor(c / 60)).padStart(2, "0")}${String(c % 60).padStart(2, "0")}`;
        }, e = t(u), t = t(i), i < u ? (F(e, y, r, 17), F(t, y, n, 17)) : (F(e, y, n, 17), F(t, y, r, 17));
      }, d: () => Date.now(), s: () => 2147483648, c: () => performance.now(), o: (e) => {
        var t = y.length;
        if (e >>>= 0, 2147483648 < e) return !1;
        for (var r = 1; 4 >= r; r *= 2) {
          var n = t * (1 + 0.2 / r);
          n = Math.min(n, e + 100663296);
          e: {
            n = (Math.min(2147483648, 65536 * Math.ceil(Math.max(e, n) / 65536)) - ve.buffer.byteLength + 65535) / 65536 | 0;
            try {
              ve.grow(n), pt();
              var i = 1;
              break e;
            } catch {
            }
            i = void 0;
          }
          if (i) return !0;
        }
        return !1;
      }, E: (e, t) => {
        var r = 0;
        return $t().forEach((n, i) => {
          var u = t + r;
          for (i = k[e + 4 * i >> 2] = u, u = 0; u < n.length; ++u) N[i++] = n.charCodeAt(u);
          N[i] = 0, r += n.length + 1;
        }), 0;
      }, F: (e, t) => {
        var r = $t();
        k[e >> 2] = r.length;
        var n = 0;
        return r.forEach((i) => n += i.length + 1), k[t >> 2] = n, 0;
      }, e: function(e) {
        try {
          var t = M(e);
          return rt(t), 0;
        } catch (r) {
          if (typeof E > "u" || r.name !== "ErrnoError") throw r;
          return r.Pa;
        }
      }, p: function(e, t) {
        try {
          var r = M(e);
          return N[t] = r.tty ? 2 : S(r.mode) ? 3 : (r.mode & 61440) === 40960 ? 7 : 4, ue[t + 2 >> 1] = 0, P[t + 8 >> 3] = BigInt(0), P[t + 16 >> 3] = BigInt(0), 0;
        } catch (n) {
          if (typeof E > "u" || n.name !== "ErrnoError") throw n;
          return n.Pa;
        }
      }, w: function(e, t, r, n) {
        try {
          e: {
            var i = M(e);
            e = t;
            for (var u, a = t = 0; a < r; a++) {
              var c = k[e >> 2], _ = k[e + 4 >> 2];
              e += 8;
              var b = It(i, N, c, _, u);
              if (0 > b) {
                var A = -1;
                break e;
              }
              if (t += b, b < _) break;
              typeof u < "u" && (u += b);
            }
            A = t;
          }
          return k[n >> 2] = A, 0;
        } catch (x) {
          if (typeof E > "u" || x.name !== "ErrnoError") throw x;
          return x.Pa;
        }
      }, D: function(e, t, r, n) {
        t = -9007199254740992 > t || 9007199254740992 < t ? NaN : Number(t);
        try {
          if (isNaN(t)) return 61;
          var i = M(e);
          return Ft(i, t, r), P[n >> 3] = BigInt(i.position), i.ob && t === 0 && r === 0 && (i.ob = null), 0;
        } catch (u) {
          if (typeof E > "u" || u.name !== "ErrnoError") throw u;
          return u.Pa;
        }
      }, I: function(e) {
        var r;
        try {
          var t = M(e);
          return (r = t.Ma) != null && r.fsync ? t.Ma.fsync(t) : 0;
        } catch (n) {
          if (typeof E > "u" || n.name !== "ErrnoError") throw n;
          return n.Pa;
        }
      }, t: function(e, t, r, n) {
        try {
          e: {
            var i = M(e);
            e = t;
            for (var u, a = t = 0; a < r; a++) {
              var c = k[e >> 2], _ = k[e + 4 >> 2];
              e += 8;
              var b = Qt(i, N, c, _, u);
              if (0 > b) {
                var A = -1;
                break e;
              }
              if (t += b, b < _) break;
              typeof u < "u" && (u += b);
            }
            A = t;
          }
          return k[n >> 2] = A, 0;
        } catch (x) {
          if (typeof E > "u" || x.name !== "ErrnoError") throw x;
          return x.Pa;
        }
      }, k: Bt }, m;
      (async function() {
        var r;
        function e(n) {
          var i;
          return m = n.exports, ve = m.M, pt(), I = m.O, G--, (i = o.monitorRunDependencies) == null || i.call(o, G), G == 0 && ae && (n = ae, ae = null, n()), m;
        }
        G++, (r = o.monitorRunDependencies) == null || r.call(o, G);
        var t = { a: Nr };
        return o.instantiateWasm ? new Promise((n) => {
          o.instantiateWasm(t, (i, u) => {
            e(i), n(i.exports);
          });
        }) : (Be ??= o.locateFile ? o.locateFile("sql-wasm.wasm", W) : W + "sql-wasm.wasm", e((await ar(t)).instance));
      })(), o._sqlite3_free = (e) => (o._sqlite3_free = m.P)(e), o._sqlite3_value_text = (e) => (o._sqlite3_value_text = m.Q)(e), o._sqlite3_prepare_v2 = (e, t, r, n, i) => (o._sqlite3_prepare_v2 = m.R)(e, t, r, n, i), o._sqlite3_step = (e) => (o._sqlite3_step = m.S)(e), o._sqlite3_reset = (e) => (o._sqlite3_reset = m.T)(e), o._sqlite3_exec = (e, t, r, n, i) => (o._sqlite3_exec = m.U)(e, t, r, n, i), o._sqlite3_finalize = (e) => (o._sqlite3_finalize = m.V)(e), o._sqlite3_column_name = (e, t) => (o._sqlite3_column_name = m.W)(e, t), o._sqlite3_column_text = (e, t) => (o._sqlite3_column_text = m.X)(e, t), o._sqlite3_column_type = (e, t) => (o._sqlite3_column_type = m.Y)(e, t), o._sqlite3_errmsg = (e) => (o._sqlite3_errmsg = m.Z)(e), o._sqlite3_clear_bindings = (e) => (o._sqlite3_clear_bindings = m._)(e), o._sqlite3_value_blob = (e) => (o._sqlite3_value_blob = m.$)(e), o._sqlite3_value_bytes = (e) => (o._sqlite3_value_bytes = m.aa)(e), o._sqlite3_value_double = (e) => (o._sqlite3_value_double = m.ba)(e), o._sqlite3_value_int = (e) => (o._sqlite3_value_int = m.ca)(e), o._sqlite3_value_type = (e) => (o._sqlite3_value_type = m.da)(e), o._sqlite3_result_blob = (e, t, r, n) => (o._sqlite3_result_blob = m.ea)(e, t, r, n), o._sqlite3_result_double = (e, t) => (o._sqlite3_result_double = m.fa)(e, t), o._sqlite3_result_error = (e, t, r) => (o._sqlite3_result_error = m.ga)(e, t, r), o._sqlite3_result_int = (e, t) => (o._sqlite3_result_int = m.ha)(e, t), o._sqlite3_result_int64 = (e, t) => (o._sqlite3_result_int64 = m.ia)(e, t), o._sqlite3_result_null = (e) => (o._sqlite3_result_null = m.ja)(e), o._sqlite3_result_text = (e, t, r, n) => (o._sqlite3_result_text = m.ka)(e, t, r, n), o._sqlite3_aggregate_context = (e, t) => (o._sqlite3_aggregate_context = m.la)(e, t), o._sqlite3_column_count = (e) => (o._sqlite3_column_count = m.ma)(e), o._sqlite3_data_count = (e) => (o._sqlite3_data_count = m.na)(e), o._sqlite3_column_blob = (e, t) => (o._sqlite3_column_blob = m.oa)(e, t), o._sqlite3_column_bytes = (e, t) => (o._sqlite3_column_bytes = m.pa)(e, t), o._sqlite3_column_double = (e, t) => (o._sqlite3_column_double = m.qa)(e, t), o._sqlite3_bind_blob = (e, t, r, n, i) => (o._sqlite3_bind_blob = m.ra)(e, t, r, n, i), o._sqlite3_bind_double = (e, t, r) => (o._sqlite3_bind_double = m.sa)(e, t, r), o._sqlite3_bind_int = (e, t, r) => (o._sqlite3_bind_int = m.ta)(e, t, r), o._sqlite3_bind_text = (e, t, r, n, i) => (o._sqlite3_bind_text = m.ua)(e, t, r, n, i), o._sqlite3_bind_parameter_index = (e, t) => (o._sqlite3_bind_parameter_index = m.va)(e, t), o._sqlite3_sql = (e) => (o._sqlite3_sql = m.wa)(e), o._sqlite3_normalized_sql = (e) => (o._sqlite3_normalized_sql = m.xa)(e), o._sqlite3_changes = (e) => (o._sqlite3_changes = m.ya)(e), o._sqlite3_close_v2 = (e) => (o._sqlite3_close_v2 = m.za)(e), o._sqlite3_create_function_v2 = (e, t, r, n, i, u, a, c, _) => (o._sqlite3_create_function_v2 = m.Aa)(e, t, r, n, i, u, a, c, _), o._sqlite3_update_hook = (e, t, r) => (o._sqlite3_update_hook = m.Ba)(e, t, r), o._sqlite3_open = (e, t) => (o._sqlite3_open = m.Ca)(e, t);
      var at = o._malloc = (e) => (at = o._malloc = m.Da)(e), Pe = o._free = (e) => (Pe = o._free = m.Ea)(e);
      o._RegisterExtensionFunctions = (e) => (o._RegisterExtensionFunctions = m.Fa)(e);
      var Ct = (e, t) => (Ct = m.Ga)(e, t), Ht = (e, t) => (Ht = m.Ha)(e, t), pe = (e) => (pe = m.Ia)(e), Y = (e) => (Y = m.Ja)(e), de = () => (de = m.Ka)();
      o.stackSave = () => de(), o.stackRestore = (e) => pe(e), o.stackAlloc = (e) => Y(e), o.cwrap = (e, t, r, n) => {
        var i = !r || r.every((u) => u === "number" || u === "boolean");
        return t !== "string" && i && !n ? o["_" + e] : (...u) => kr(e, t, r, u);
      }, o.addFunction = me, o.removeFunction = X, o.UTF8ToString = He, o.ALLOC_NORMAL = Le, o.allocate = Re, o.allocateUTF8OnStack = st;
      function lt() {
        function e() {
          var i;
          if (o.calledRun = !0, !ge) {
            if (!o.noFSInit && !Mt) {
              var t, r;
              Mt = !0, n ??= o.stdin, t ??= o.stdout, r ??= o.stderr, n ? V("stdin", n) : tt("/dev/tty", "/dev/stdin"), t ? V("stdout", null, t) : tt("/dev/tty", "/dev/stdout"), r ? V("stderr", null, r) : tt("/dev/tty1", "/dev/stderr"), oe("/dev/stdin", 0), oe("/dev/stdout", 1), oe("/dev/stderr", 1);
            }
            if (m.N(), St = !1, (i = o.onRuntimeInitialized) == null || i.call(o), o.postRun) for (typeof o.postRun == "function" && (o.postRun = [o.postRun]); o.postRun.length; ) {
              var n = o.postRun.shift();
              wt.unshift(n);
            }
            dt(wt);
          }
        }
        if (0 < G) ae = lt;
        else {
          if (o.preRun) for (typeof o.preRun == "function" && (o.preRun = [o.preRun]); o.preRun.length; ) lr();
          dt(bt), 0 < G ? ae = lt : o.setStatus ? (o.setStatus("Running..."), setTimeout(() => {
            setTimeout(() => o.setStatus(""), 1), e();
          }, 1)) : e();
        }
      }
      if (o.preInit) for (typeof o.preInit == "function" && (o.preInit = [o.preInit]); 0 < o.preInit.length; ) o.preInit.pop()();
      return lt(), j;
    }), B);
  };
  Q.exports = $, Q.exports.default = $;
})(rr);
var nr = rr.exports;
const on = /* @__PURE__ */ en(nr), fn = /* @__PURE__ */ nn({
  __proto__: null,
  default: on
}, [nr]);
export {
  fn as s
};
