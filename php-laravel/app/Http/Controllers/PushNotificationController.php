<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Minishlink\WebPush\Subscription as WebPushSubscription;
use Minishlink\WebPush\WebPush;
use App\Models\Subscription;

class PushNotificationController extends Controller
{
    public function subscribe(Request $request)
    {
        Subscription::updateOrCreate(
            ['endpoint' => $request->input('endpoint')],
            [
                'public_key' => $request->input('keys.p256dh'),
                'auth_token' => $request->input('keys.auth'),
            ]
        );

        return response()->json(['success' => true], 201);
    }

    public function sendNotification(Request $request)
    {
        $subscriptions = Subscription::all();
        if ($subscriptions->isEmpty()) {
            return response()->json(['error' => 'No subscriptions found'], 400);
        }

        $auth = [
            'VAPID' => [
                'subject' => 'mailto:example@yourdomain.org',
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];

        $webPush = new WebPush($auth);

        $payload = json_encode([
            'title' => 'Push Notification',
            'body' => $request->input('message', 'Default message'),
            'url' => $request->input('url', 'https://yourwebsite.com')
        ]);

        foreach ($subscriptions as $subscription) {
            $webPushSubscription = WebPushSubscription::create([
                'endpoint' => $subscription->endpoint,
                'publicKey' => $subscription->public_key,
                'authToken' => $subscription->auth_token,
            ]);

            $webPush->queueNotification($webPushSubscription, $payload);
        }

        foreach ($webPush->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();

            if ($report->isSuccess()) {
                echo "[v] Message sent successfully for subscription {$endpoint}.";
            } else {
                if ($report->getResponse()->getStatusCode() === 410) {
                    $subscription = Subscription::where('endpoint', $endpoint)->first();
                    if ($subscription) {
                        $subscription->delete();
                    }
                    echo "[x] Subscription {$endpoint} has expired and was removed.";
                } else {
                    echo "[x] Message failed to send for subscription {$endpoint}: {$report->getReason()}";
                }
            }
        }

        return response()->json(['success' => true]);
    }
}
