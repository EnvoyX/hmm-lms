/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => {
  // webpackBootstrap
  /******/ "use strict";
  /******/ var __webpack_modules__ = {
    /***/ "./worker/index.js":
      /*!*************************!*\
  !*** ./worker/index.js ***!
  \*************************/
      /***/ (__webpack_module__, __webpack_exports__, __webpack_require__) => {
        eval(
          __webpack_require__.ts(
            '__webpack_require__.r(__webpack_exports__);\n// Claim clients immediately\nself.addEventListener("activate", (event)=>{\n    event.waitUntil(self.clients.claim());\n});\n// Push notification handler\nself.addEventListener("push", function(event) {\n    if (!event.data) return;\n    let data;\n    try {\n        data = event.data.json();\n    } catch (e) {\n        // Fallback for plain text messages\n        data = {\n            title: "Notification",\n            body: event.data.text(),\n            url: "/"\n        };\n    }\n    const options = {\n        body: data.body,\n        icon: "/icons/icon-512x512.png",\n        badge: "/icons/icon-192x192.png",\n        vibrate: [\n            100,\n            50,\n            100\n        ],\n        data: {\n            dateOfArrival: Date.now(),\n            primaryKey: 1,\n            url: data.url || "/",\n            type: data.type\n        },\n        actions: [\n            {\n                action: "view",\n                title: "View",\n                icon: "/icons/checkmark.png"\n            },\n            {\n                action: "close",\n                title: "Close",\n                icon: "/icons/xmark.png"\n            }\n        ],\n        tag: data.tag || "default",\n        renotify: true\n    };\n    event.waitUntil(self.registration.showNotification(data.title, options));\n});\n// Notification click handler\nself.addEventListener("notificationclick", (event)=>{\n    event.notification.close();\n    const urlToOpen = new URL(event.notification.data?.url || "/", self.location.origin).href;\n    event.waitUntil(clients.matchAll({\n        type: "window",\n        includeUncontrolled: true\n    }).then((clientList)=>{\n        // Focus existing window if found\n        for (const client of clientList){\n            if (client.url === urlToOpen && "focus" in client) {\n                return client.focus();\n            }\n        }\n        // Open new window if no match found\n        if (clients.openWindow) {\n            return clients.openWindow(urlToOpen);\n        }\n    }));\n});\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we\'re in a\n        // browser context before continuing.\n        if (typeof self !== \'undefined\' &&\n            // No-JS mode does not inject these helpers:\n            \'$RefreshHelpers$\' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = __webpack_module__.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = __webpack_module__.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, __webpack_module__.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                __webpack_module__.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we\'ll check if it\'s\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we\'ll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        __webpack_module__.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it\'s possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    __webpack_module__.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi93b3JrZXIvaW5kZXguanMiLCJtYXBwaW5ncyI6IjtBQUFBLDRCQUE0QjtBQUM1QkEsS0FBS0MsZ0JBQWdCLENBQUMsWUFBWSxDQUFDQztJQUNqQ0EsTUFBTUMsU0FBUyxDQUFDSCxLQUFLSSxPQUFPLENBQUNDLEtBQUs7QUFDcEM7QUFFQSw0QkFBNEI7QUFDNUJMLEtBQUtDLGdCQUFnQixDQUFDLFFBQVEsU0FBVUMsS0FBSztJQUMzQyxJQUFJLENBQUNBLE1BQU1JLElBQUksRUFBRTtJQUVqQixJQUFJQTtJQUNKLElBQUk7UUFDRkEsT0FBT0osTUFBTUksSUFBSSxDQUFDQyxJQUFJO0lBQ3hCLEVBQUUsT0FBT0MsR0FBRztRQUNWLG1DQUFtQztRQUNuQ0YsT0FBTztZQUNMRyxPQUFPO1lBQ1BDLE1BQU1SLE1BQU1JLElBQUksQ0FBQ0ssSUFBSTtZQUNyQkMsS0FBSztRQUNQO0lBQ0Y7SUFFQSxNQUFNQyxVQUFVO1FBQ2RILE1BQU1KLEtBQUtJLElBQUk7UUFDZkksTUFBTTtRQUNOQyxPQUFPO1FBQ1BDLFNBQVM7WUFBQztZQUFLO1lBQUk7U0FBSTtRQUN2QlYsTUFBTTtZQUNKVyxlQUFlQyxLQUFLQyxHQUFHO1lBQ3ZCQyxZQUFZO1lBQ1pSLEtBQUtOLEtBQUtNLEdBQUcsSUFBSTtZQUNqQlMsTUFBTWYsS0FBS2UsSUFBSTtRQUNqQjtRQUNBQyxTQUFTO1lBQ1A7Z0JBQ0VDLFFBQVE7Z0JBQ1JkLE9BQU87Z0JBQ1BLLE1BQU07WUFDUjtZQUNBO2dCQUNFUyxRQUFRO2dCQUNSZCxPQUFPO2dCQUNQSyxNQUFNO1lBQ1I7U0FDRDtRQUNEVSxLQUFLbEIsS0FBS2tCLEdBQUcsSUFBSTtRQUNqQkMsVUFBVTtJQUNaO0lBRUF2QixNQUFNQyxTQUFTLENBQUNILEtBQUswQixZQUFZLENBQUNDLGdCQUFnQixDQUFDckIsS0FBS0csS0FBSyxFQUFFSTtBQUNqRTtBQUVBLDZCQUE2QjtBQUM3QmIsS0FBS0MsZ0JBQWdCLENBQUMscUJBQXFCLENBQUNDO0lBQzFDQSxNQUFNMEIsWUFBWSxDQUFDQyxLQUFLO0lBRXhCLE1BQU1DLFlBQVksSUFBSUMsSUFDcEI3QixNQUFNMEIsWUFBWSxDQUFDdEIsSUFBSSxFQUFFTSxPQUFPLEtBQ2hDWixLQUFLZ0MsUUFBUSxDQUFDQyxNQUFNLEVBQ3BCQyxJQUFJO0lBRU5oQyxNQUFNQyxTQUFTLENBQ2JDLFFBQ0crQixRQUFRLENBQUM7UUFBRWQsTUFBTTtRQUFVZSxxQkFBcUI7SUFBSyxHQUNyREMsSUFBSSxDQUFDLENBQUNDO1FBQ0wsaUNBQWlDO1FBQ2pDLEtBQUssTUFBTUMsVUFBVUQsV0FBWTtZQUMvQixJQUFJQyxPQUFPM0IsR0FBRyxLQUFLa0IsYUFBYSxXQUFXUyxRQUFRO2dCQUNqRCxPQUFPQSxPQUFPQyxLQUFLO1lBQ3JCO1FBQ0Y7UUFDQSxvQ0FBb0M7UUFDcEMsSUFBSXBDLFFBQVFxQyxVQUFVLEVBQUU7WUFDdEIsT0FBT3JDLFFBQVFxQyxVQUFVLENBQUNYO1FBQzVCO0lBQ0Y7QUFFTiIsInNvdXJjZXMiOlsiRDpcXFdlYiBEZXZcXEhNTVxcaG1tLWxtc1xcd29ya2VyXFxpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDbGFpbSBjbGllbnRzIGltbWVkaWF0ZWx5XHJcbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcihcImFjdGl2YXRlXCIsIChldmVudCkgPT4ge1xyXG4gIGV2ZW50LndhaXRVbnRpbChzZWxmLmNsaWVudHMuY2xhaW0oKSk7XHJcbn0pO1xyXG5cclxuLy8gUHVzaCBub3RpZmljYXRpb24gaGFuZGxlclxyXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoXCJwdXNoXCIsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gIGlmICghZXZlbnQuZGF0YSkgcmV0dXJuO1xyXG5cclxuICBsZXQgZGF0YTtcclxuICB0cnkge1xyXG4gICAgZGF0YSA9IGV2ZW50LmRhdGEuanNvbigpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIC8vIEZhbGxiYWNrIGZvciBwbGFpbiB0ZXh0IG1lc3NhZ2VzXHJcbiAgICBkYXRhID0ge1xyXG4gICAgICB0aXRsZTogXCJOb3RpZmljYXRpb25cIixcclxuICAgICAgYm9keTogZXZlbnQuZGF0YS50ZXh0KCksXHJcbiAgICAgIHVybDogXCIvXCIsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgIGJvZHk6IGRhdGEuYm9keSxcclxuICAgIGljb246IFwiL2ljb25zL2ljb24tNTEyeDUxMi5wbmdcIixcclxuICAgIGJhZGdlOiBcIi9pY29ucy9pY29uLTE5MngxOTIucG5nXCIsXHJcbiAgICB2aWJyYXRlOiBbMTAwLCA1MCwgMTAwXSxcclxuICAgIGRhdGE6IHtcclxuICAgICAgZGF0ZU9mQXJyaXZhbDogRGF0ZS5ub3coKSxcclxuICAgICAgcHJpbWFyeUtleTogMSxcclxuICAgICAgdXJsOiBkYXRhLnVybCB8fCBcIi9cIixcclxuICAgICAgdHlwZTogZGF0YS50eXBlLFxyXG4gICAgfSxcclxuICAgIGFjdGlvbnM6IFtcclxuICAgICAge1xyXG4gICAgICAgIGFjdGlvbjogXCJ2aWV3XCIsXHJcbiAgICAgICAgdGl0bGU6IFwiVmlld1wiLFxyXG4gICAgICAgIGljb246IFwiL2ljb25zL2NoZWNrbWFyay5wbmdcIixcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGFjdGlvbjogXCJjbG9zZVwiLFxyXG4gICAgICAgIHRpdGxlOiBcIkNsb3NlXCIsXHJcbiAgICAgICAgaWNvbjogXCIvaWNvbnMveG1hcmsucG5nXCIsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgdGFnOiBkYXRhLnRhZyB8fCBcImRlZmF1bHRcIixcclxuICAgIHJlbm90aWZ5OiB0cnVlLFxyXG4gIH07XHJcblxyXG4gIGV2ZW50LndhaXRVbnRpbChzZWxmLnJlZ2lzdHJhdGlvbi5zaG93Tm90aWZpY2F0aW9uKGRhdGEudGl0bGUsIG9wdGlvbnMpKTtcclxufSk7XHJcblxyXG4vLyBOb3RpZmljYXRpb24gY2xpY2sgaGFuZGxlclxyXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoXCJub3RpZmljYXRpb25jbGlja1wiLCAoZXZlbnQpID0+IHtcclxuICBldmVudC5ub3RpZmljYXRpb24uY2xvc2UoKTtcclxuXHJcbiAgY29uc3QgdXJsVG9PcGVuID0gbmV3IFVSTChcclxuICAgIGV2ZW50Lm5vdGlmaWNhdGlvbi5kYXRhPy51cmwgfHwgXCIvXCIsXHJcbiAgICBzZWxmLmxvY2F0aW9uLm9yaWdpbixcclxuICApLmhyZWY7XHJcblxyXG4gIGV2ZW50LndhaXRVbnRpbChcclxuICAgIGNsaWVudHNcclxuICAgICAgLm1hdGNoQWxsKHsgdHlwZTogXCJ3aW5kb3dcIiwgaW5jbHVkZVVuY29udHJvbGxlZDogdHJ1ZSB9KVxyXG4gICAgICAudGhlbigoY2xpZW50TGlzdCkgPT4ge1xyXG4gICAgICAgIC8vIEZvY3VzIGV4aXN0aW5nIHdpbmRvdyBpZiBmb3VuZFxyXG4gICAgICAgIGZvciAoY29uc3QgY2xpZW50IG9mIGNsaWVudExpc3QpIHtcclxuICAgICAgICAgIGlmIChjbGllbnQudXJsID09PSB1cmxUb09wZW4gJiYgXCJmb2N1c1wiIGluIGNsaWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY2xpZW50LmZvY3VzKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE9wZW4gbmV3IHdpbmRvdyBpZiBubyBtYXRjaCBmb3VuZFxyXG4gICAgICAgIGlmIChjbGllbnRzLm9wZW5XaW5kb3cpIHtcclxuICAgICAgICAgIHJldHVybiBjbGllbnRzLm9wZW5XaW5kb3codXJsVG9PcGVuKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pLFxyXG4gICk7XHJcbn0pO1xyXG4iXSwibmFtZXMiOlsic2VsZiIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsIndhaXRVbnRpbCIsImNsaWVudHMiLCJjbGFpbSIsImRhdGEiLCJqc29uIiwiZSIsInRpdGxlIiwiYm9keSIsInRleHQiLCJ1cmwiLCJvcHRpb25zIiwiaWNvbiIsImJhZGdlIiwidmlicmF0ZSIsImRhdGVPZkFycml2YWwiLCJEYXRlIiwibm93IiwicHJpbWFyeUtleSIsInR5cGUiLCJhY3Rpb25zIiwiYWN0aW9uIiwidGFnIiwicmVub3RpZnkiLCJyZWdpc3RyYXRpb24iLCJzaG93Tm90aWZpY2F0aW9uIiwibm90aWZpY2F0aW9uIiwiY2xvc2UiLCJ1cmxUb09wZW4iLCJVUkwiLCJsb2NhdGlvbiIsIm9yaWdpbiIsImhyZWYiLCJtYXRjaEFsbCIsImluY2x1ZGVVbmNvbnRyb2xsZWQiLCJ0aGVuIiwiY2xpZW50TGlzdCIsImNsaWVudCIsImZvY3VzIiwib3BlbldpbmRvdyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./worker/index.js\n',
          ),
        );

        /***/
      },

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ if (cachedModule.error !== undefined) throw cachedModule.error;
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ id: moduleId,
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ var threw = true;
    /******/ try {
      /******/ __webpack_modules__[moduleId](
        module,
        module.exports,
        __webpack_require__,
      );
      /******/ threw = false;
      /******/
    } finally {
      /******/ if (threw) delete __webpack_module_cache__[moduleId];
      /******/
    }
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/make namespace object */
  /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: "Module",
        });
        /******/
      }
      /******/ Object.defineProperty(exports, "__esModule", { value: true });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/trusted types policy */
  /******/ (() => {
    /******/ var policy;
    /******/ __webpack_require__.tt = () => {
      /******/ // Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
      /******/ if (policy === undefined) {
        /******/ policy = {
          /******/ createScript: (script) => script,
          /******/
        };
        /******/ if (
          typeof trustedTypes !== "undefined" &&
          trustedTypes.createPolicy
        ) {
          /******/ policy = trustedTypes.createPolicy("nextjs#bundler", policy);
          /******/
        }
        /******/
      }
      /******/ return policy;
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/trusted types script */
  /******/ (() => {
    /******/ __webpack_require__.ts = (script) =>
      __webpack_require__.tt().createScript(script);
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/react refresh */
  /******/ (() => {
    /******/ if (__webpack_require__.i) {
      /******/ __webpack_require__.i.push((options) => {
        /******/ const originalFactory = options.factory;
        /******/ options.factory = (
          moduleObject,
          moduleExports,
          webpackRequire,
        ) => {
          /******/ if (!originalFactory) {
            /******/ document.location.reload();
            /******/ return;
            /******/
          }
          /******/ const hasRefresh =
            typeof self !== "undefined" &&
            !!self.$RefreshInterceptModuleExecution$;
          /******/ const cleanup = hasRefresh
            ? self.$RefreshInterceptModuleExecution$(moduleObject.id)
            : () => {};
          /******/ try {
            /******/ originalFactory.call(
              this,
              moduleObject,
              moduleExports,
              webpackRequire,
            );
            /******/
          } finally {
            /******/ cleanup();
            /******/
          }
          /******/
        };
        /******/
      });
      /******/
    }
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/compat */
  /******/
  /******/
  /******/ // noop fns to prevent runtime errors during initialization
  /******/ if (typeof self !== "undefined") {
    /******/ self.$RefreshReg$ = function () {};
    /******/ self.$RefreshSig$ = function () {
      /******/ return function (type) {
        /******/ return type;
        /******/
      };
      /******/
    };
    /******/
  }
  /******/
  /************************************************************************/
  /******/
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ // This entry module can't be inlined because the eval-source-map devtool is used.
  /******/ var __webpack_exports__ = __webpack_require__("./worker/index.js");
  /******/
  /******/
})();
