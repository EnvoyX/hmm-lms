"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Extend Navigator interface for iOS standalone detection
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export function InstallPrompt() {
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkInstalled();

    // Handle beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;

      // Only show banner if not installed and not previously dismissed
      if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
        setShowBanner(true);
      }
    };

    // Handle successful installation
    const handleAppInstalled = () => {
      setShowBanner(false);
      setIsInstalled(true);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS Safari - show manual install instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.navigator.standalone;

    if (isIOS && !isInStandaloneMode && !localStorage.getItem('pwa-install-dismissed')) {
      // Small delay to avoid conflicts with other prompts
      setTimeout(() => setShowBanner(true), 2000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt.current) {
      try {
        await deferredPrompt.current.prompt();
        const choiceResult = await deferredPrompt.current.userChoice;

        if (choiceResult.outcome === "accepted") {
          console.log("User accepted install");
        }

        setShowBanner(false);
        deferredPrompt.current = null;
      } catch (error) {
        console.error('Install prompt failed:', error);
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showBanner || isInstalled) return null;

  // const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <Card className="fixed bottom-4 left-4 sm:right-auto sm:max-w-sm z-50 shadow-lg w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Install App</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {false
            ? "Tap the share button and select 'Add to Home Screen'"
            : "Install this app for a better experience"
          }
        </CardDescription>
      </CardHeader>
      {true && (
        <CardContent className="pt-0">
          <Button
            onClick={handleInstall}
            className="w-full"
            size="sm"
          >
            Install Now
          </Button>
        </CardContent>
      )}
    </Card>
  );
}