/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./worker/index.js":
/*!*************************!*\
  !*** ./worker/index.js ***!
  \*************************/
/***/ ((__webpack_module__, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n// Claim clients immediately\nself.addEventListener(\"activate\", (event)=>{\n    event.waitUntil(self.clients.claim());\n});\n// Push notification handler\nself.addEventListener(\"push\", function(event) {\n    if (!event.data) return;\n    let data;\n    try {\n        data = event.data.json();\n    } catch (e) {\n        // Fallback for plain text messages\n        data = {\n            title: \"Notification\",\n            body: event.data.text(),\n            url: \"/\"\n        };\n    }\n    const options = {\n        body: data.body,\n        icon: \"/icons/icon-512x512.png\",\n        badge: \"/icons/icon-192x192.png\",\n        vibrate: [\n            100,\n            50,\n            100\n        ],\n        data: {\n            dateOfArrival: Date.now(),\n            primaryKey: 1,\n            url: data.url || \"/\",\n            type: data.type\n        },\n        actions: [\n            {\n                action: \"view\",\n                title: \"View\",\n                icon: \"/icons/checkmark.png\"\n            },\n            {\n                action: \"close\",\n                title: \"Close\",\n                icon: \"/icons/xmark.png\"\n            }\n        ],\n        tag: data.tag || \"default\",\n        renotify: true\n    };\n    event.waitUntil(self.registration.showNotification(data.title, options));\n});\n// Notification click handler\nself.addEventListener(\"notificationclick\", (event)=>{\n    event.notification.close();\n    const urlToOpen = new URL(event.notification.data?.url || \"/\", self.location.origin).href;\n    event.waitUntil(clients.matchAll({\n        type: \"window\",\n        includeUncontrolled: true\n    }).then((clientList)=>{\n        // Focus existing window if found\n        for (const client of clientList){\n            if (client.url === urlToOpen && \"focus\" in client) {\n                return client.focus();\n            }\n        }\n        // Open new window if no match found\n        if (clients.openWindow) {\n            return clients.openWindow(urlToOpen);\n        }\n    }));\n});\n\n\n;\n    (function() {\n      var _a, _b;\n      if (typeof self < \"u\" && \"$RefreshHelpers$\" in self) {\n        var currentExports = __webpack_module__.exports, prevSignature = (_b = (_a = __webpack_module__.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, __webpack_module__.id);\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n          __webpack_module__.hot.dispose(function(data) {\n            data.prevSignature = self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n          });\n          /* unsupported import.meta.webpackHot */ undefined.accept();\n          if (prevSignature !== null)\n            if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports)))\n              __webpack_module__.hot.invalidate();\n            else\n              self.$RefreshHelpers$.scheduleUpdate();\n        } else {\n          var isNoLongerABoundary = prevSignature !== null;\n          if (isNoLongerABoundary)\n            __webpack_module__.hot.invalidate();\n        }\n      }\n    })();\n  //# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi93b3JrZXIvaW5kZXguanMiLCJtYXBwaW5ncyI6IjtBQUFBLDRCQUE0QjtBQUM1QkEsS0FBS0MsZ0JBQWdCLENBQUMsWUFBWSxDQUFDQztJQUNqQ0EsTUFBTUMsU0FBUyxDQUFDSCxLQUFLSSxPQUFPLENBQUNDLEtBQUs7QUFDcEM7QUFFQSw0QkFBNEI7QUFDNUJMLEtBQUtDLGdCQUFnQixDQUFDLFFBQVEsU0FBVUMsS0FBSztJQUMzQyxJQUFJLENBQUNBLE1BQU1JLElBQUksRUFBRTtJQUVqQixJQUFJQTtJQUNKLElBQUk7UUFDRkEsT0FBT0osTUFBTUksSUFBSSxDQUFDQyxJQUFJO0lBQ3hCLEVBQUUsT0FBT0MsR0FBRztRQUNWLG1DQUFtQztRQUNuQ0YsT0FBTztZQUNMRyxPQUFPO1lBQ1BDLE1BQU1SLE1BQU1JLElBQUksQ0FBQ0ssSUFBSTtZQUNyQkMsS0FBSztRQUNQO0lBQ0Y7SUFFQSxNQUFNQyxVQUFVO1FBQ2RILE1BQU1KLEtBQUtJLElBQUk7UUFDZkksTUFBTTtRQUNOQyxPQUFPO1FBQ1BDLFNBQVM7WUFBQztZQUFLO1lBQUk7U0FBSTtRQUN2QlYsTUFBTTtZQUNKVyxlQUFlQyxLQUFLQyxHQUFHO1lBQ3ZCQyxZQUFZO1lBQ1pSLEtBQUtOLEtBQUtNLEdBQUcsSUFBSTtZQUNqQlMsTUFBTWYsS0FBS2UsSUFBSTtRQUNqQjtRQUNBQyxTQUFTO1lBQ1A7Z0JBQ0VDLFFBQVE7Z0JBQ1JkLE9BQU87Z0JBQ1BLLE1BQU07WUFDUjtZQUNBO2dCQUNFUyxRQUFRO2dCQUNSZCxPQUFPO2dCQUNQSyxNQUFNO1lBQ1I7U0FDRDtRQUNEVSxLQUFLbEIsS0FBS2tCLEdBQUcsSUFBSTtRQUNqQkMsVUFBVTtJQUNaO0lBRUF2QixNQUFNQyxTQUFTLENBQUNILEtBQUswQixZQUFZLENBQUNDLGdCQUFnQixDQUFDckIsS0FBS0csS0FBSyxFQUFFSTtBQUNqRTtBQUVBLDZCQUE2QjtBQUM3QmIsS0FBS0MsZ0JBQWdCLENBQUMscUJBQXFCLENBQUNDO0lBQzFDQSxNQUFNMEIsWUFBWSxDQUFDQyxLQUFLO0lBRXhCLE1BQU1DLFlBQVksSUFBSUMsSUFDcEI3QixNQUFNMEIsWUFBWSxDQUFDdEIsSUFBSSxFQUFFTSxPQUFPLEtBQ2hDWixLQUFLZ0MsUUFBUSxDQUFDQyxNQUFNLEVBQ3BCQyxJQUFJO0lBRU5oQyxNQUFNQyxTQUFTLENBQ2JDLFFBQ0crQixRQUFRLENBQUM7UUFBRWQsTUFBTTtRQUFVZSxxQkFBcUI7SUFBSyxHQUNyREMsSUFBSSxDQUFDLENBQUNDO1FBQ0wsaUNBQWlDO1FBQ2pDLEtBQUssTUFBTUMsVUFBVUQsV0FBWTtZQUMvQixJQUFJQyxPQUFPM0IsR0FBRyxLQUFLa0IsYUFBYSxXQUFXUyxRQUFRO2dCQUNqRCxPQUFPQSxPQUFPQyxLQUFLO1lBQ3JCO1FBQ0Y7UUFDQSxvQ0FBb0M7UUFDcEMsSUFBSXBDLFFBQVFxQyxVQUFVLEVBQUU7WUFDdEIsT0FBT3JDLFFBQVFxQyxVQUFVLENBQUNYO1FBQzVCO0lBQ0Y7QUFFTiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxBZG1pblxcRG9jdW1lbnRzXFxHaXRIdWJcXGhtbS1sbXNcXHdvcmtlclxcaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ2xhaW0gY2xpZW50cyBpbW1lZGlhdGVseVxyXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoXCJhY3RpdmF0ZVwiLCAoZXZlbnQpID0+IHtcclxuICBldmVudC53YWl0VW50aWwoc2VsZi5jbGllbnRzLmNsYWltKCkpO1xyXG59KTtcclxuXHJcbi8vIFB1c2ggbm90aWZpY2F0aW9uIGhhbmRsZXJcclxuc2VsZi5hZGRFdmVudExpc3RlbmVyKFwicHVzaFwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICBpZiAoIWV2ZW50LmRhdGEpIHJldHVybjtcclxuXHJcbiAgbGV0IGRhdGE7XHJcbiAgdHJ5IHtcclxuICAgIGRhdGEgPSBldmVudC5kYXRhLmpzb24oKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICAvLyBGYWxsYmFjayBmb3IgcGxhaW4gdGV4dCBtZXNzYWdlc1xyXG4gICAgZGF0YSA9IHtcclxuICAgICAgdGl0bGU6IFwiTm90aWZpY2F0aW9uXCIsXHJcbiAgICAgIGJvZHk6IGV2ZW50LmRhdGEudGV4dCgpLFxyXG4gICAgICB1cmw6IFwiL1wiLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICBib2R5OiBkYXRhLmJvZHksXHJcbiAgICBpY29uOiBcIi9pY29ucy9pY29uLTUxMng1MTIucG5nXCIsXHJcbiAgICBiYWRnZTogXCIvaWNvbnMvaWNvbi0xOTJ4MTkyLnBuZ1wiLFxyXG4gICAgdmlicmF0ZTogWzEwMCwgNTAsIDEwMF0sXHJcbiAgICBkYXRhOiB7XHJcbiAgICAgIGRhdGVPZkFycml2YWw6IERhdGUubm93KCksXHJcbiAgICAgIHByaW1hcnlLZXk6IDEsXHJcbiAgICAgIHVybDogZGF0YS51cmwgfHwgXCIvXCIsXHJcbiAgICAgIHR5cGU6IGRhdGEudHlwZSxcclxuICAgIH0sXHJcbiAgICBhY3Rpb25zOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBhY3Rpb246IFwidmlld1wiLFxyXG4gICAgICAgIHRpdGxlOiBcIlZpZXdcIixcclxuICAgICAgICBpY29uOiBcIi9pY29ucy9jaGVja21hcmsucG5nXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBhY3Rpb246IFwiY2xvc2VcIixcclxuICAgICAgICB0aXRsZTogXCJDbG9zZVwiLFxyXG4gICAgICAgIGljb246IFwiL2ljb25zL3htYXJrLnBuZ1wiLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICAgIHRhZzogZGF0YS50YWcgfHwgXCJkZWZhdWx0XCIsXHJcbiAgICByZW5vdGlmeTogdHJ1ZSxcclxuICB9O1xyXG5cclxuICBldmVudC53YWl0VW50aWwoc2VsZi5yZWdpc3RyYXRpb24uc2hvd05vdGlmaWNhdGlvbihkYXRhLnRpdGxlLCBvcHRpb25zKSk7XHJcbn0pO1xyXG5cclxuLy8gTm90aWZpY2F0aW9uIGNsaWNrIGhhbmRsZXJcclxuc2VsZi5hZGRFdmVudExpc3RlbmVyKFwibm90aWZpY2F0aW9uY2xpY2tcIiwgKGV2ZW50KSA9PiB7XHJcbiAgZXZlbnQubm90aWZpY2F0aW9uLmNsb3NlKCk7XHJcblxyXG4gIGNvbnN0IHVybFRvT3BlbiA9IG5ldyBVUkwoXHJcbiAgICBldmVudC5ub3RpZmljYXRpb24uZGF0YT8udXJsIHx8IFwiL1wiLFxyXG4gICAgc2VsZi5sb2NhdGlvbi5vcmlnaW4sXHJcbiAgKS5ocmVmO1xyXG5cclxuICBldmVudC53YWl0VW50aWwoXHJcbiAgICBjbGllbnRzXHJcbiAgICAgIC5tYXRjaEFsbCh7IHR5cGU6IFwid2luZG93XCIsIGluY2x1ZGVVbmNvbnRyb2xsZWQ6IHRydWUgfSlcclxuICAgICAgLnRoZW4oKGNsaWVudExpc3QpID0+IHtcclxuICAgICAgICAvLyBGb2N1cyBleGlzdGluZyB3aW5kb3cgaWYgZm91bmRcclxuICAgICAgICBmb3IgKGNvbnN0IGNsaWVudCBvZiBjbGllbnRMaXN0KSB7XHJcbiAgICAgICAgICBpZiAoY2xpZW50LnVybCA9PT0gdXJsVG9PcGVuICYmIFwiZm9jdXNcIiBpbiBjbGllbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNsaWVudC5mb2N1cygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBPcGVuIG5ldyB3aW5kb3cgaWYgbm8gbWF0Y2ggZm91bmRcclxuICAgICAgICBpZiAoY2xpZW50cy5vcGVuV2luZG93KSB7XHJcbiAgICAgICAgICByZXR1cm4gY2xpZW50cy5vcGVuV2luZG93KHVybFRvT3Blbik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KSxcclxuICApO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbInNlbGYiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJ3YWl0VW50aWwiLCJjbGllbnRzIiwiY2xhaW0iLCJkYXRhIiwianNvbiIsImUiLCJ0aXRsZSIsImJvZHkiLCJ0ZXh0IiwidXJsIiwib3B0aW9ucyIsImljb24iLCJiYWRnZSIsInZpYnJhdGUiLCJkYXRlT2ZBcnJpdmFsIiwiRGF0ZSIsIm5vdyIsInByaW1hcnlLZXkiLCJ0eXBlIiwiYWN0aW9ucyIsImFjdGlvbiIsInRhZyIsInJlbm90aWZ5IiwicmVnaXN0cmF0aW9uIiwic2hvd05vdGlmaWNhdGlvbiIsIm5vdGlmaWNhdGlvbiIsImNsb3NlIiwidXJsVG9PcGVuIiwiVVJMIiwibG9jYXRpb24iLCJvcmlnaW4iLCJocmVmIiwibWF0Y2hBbGwiLCJpbmNsdWRlVW5jb250cm9sbGVkIiwidGhlbiIsImNsaWVudExpc3QiLCJjbGllbnQiLCJmb2N1cyIsIm9wZW5XaW5kb3ciXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./worker/index.js\n"));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	(() => {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = () => {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: (script) => (script)
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	(() => {
/******/ 		__webpack_require__.ts = (script) => (__webpack_require__.tt().createScript(script));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	(() => {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push((options) => {
/******/ 			const originalFactory = options.factory;
/******/ 			options.factory = (moduleObject, moduleExports, webpackRequire) => {
/******/ 				if (!originalFactory) {
/******/ 					document.location.reload();
/******/ 					return;
/******/ 				}
/******/ 				const hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				const cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : () => {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./worker/index.js");
/******/ 	
/******/ })()
;