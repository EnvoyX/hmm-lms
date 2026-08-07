'use client';

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Bell, BellOff, Send, Info } from "lucide-react";
import { useNotifications } from '~/hooks/use-notifications';
import { Alert, AlertDescription } from "~/components/ui/alert";
import { LoadingSpinner } from '~/components/ui/loading-spinner';
import { useState } from "react";

export default function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    unsubscribe,
    isLoading,
    testNotification,
    debugInfo,
    subscriptionCheckDone,
    showServiceWorkerWarning,
  } = useNotifications();

  const [showDebug, setShowDebug] = useState(false);

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Not Available</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Push notifications are not supported in your browser.
              {debugInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    View Details
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                    {debugInfo}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>
              Get notified about announcements, events, tryouts, and more
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDebug(!showDebug)}
            title="Toggle debug info"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showDebug && debugInfo && (
          <Alert className="mb-4">
            <AlertDescription>
              <div className="text-xs font-mono whitespace-pre-wrap">
                {debugInfo}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  console.log("📋 Full diagnostic info:");
                  console.table({
                    supported: isSupported,
                    subscribed: isSubscribed,
                    permission,
                    hasNotification: "Notification" in window,
                    hasServiceWorker: "serviceWorker" in navigator,
                    hasPushManager: "PushManager" in window,
                    userAgent: navigator.userAgent,
                  });
                }}
              >
                Log Full Details to Console
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {showServiceWorkerWarning ? (
          <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
            <AlertDescription>
              <span className="font-medium">Service worker is not active.</span> Web push needs a registered
              service worker. Use a <strong>production</strong> build, or for local dev set{" "}
              <code className="rounded bg-muted px-1 text-xs">ENABLE_PWA_IN_DEV=1</code> in <code className="rounded bg-muted px-1 text-xs">.env</code> and restart. See <code className="rounded bg-muted px-1 text-xs">.env.example</code>
              .
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!subscriptionCheckDone && isSupported ? (
              <LoadingSpinner size="sm" />
            ) : isSubscribed ? (
              <Bell className="h-5 w-5 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium">
                {!subscriptionCheckDone && isSupported
                  ? "Checking subscription…"
                  : isSubscribed
                    ? "Notifications enabled"
                    : "Notifications disabled"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed
                  ? "You will receive push notifications for announcements and events"
                  : "Enable to receive important updates in this browser"}
              </p>
            </div>
          </div>

          <Button
            variant={isSubscribed ? "destructive" : "default"}
            onClick={isSubscribed ? unsubscribe : requestPermission}
            disabled={isLoading || (isSupported && !subscriptionCheckDone)}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : isSubscribed ? "Disable" : "Enable"}
          </Button>
        </div>

        {isSubscribed && (
          <div className="pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={testNotification}
              className="w-full"
              disabled={isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
          </div>
        )}

        {permission === 'denied' && (
          <Alert className="mt-4">
            <AlertDescription>
              You have blocked notifications. Please enable them in your browser settings to receive updates.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
