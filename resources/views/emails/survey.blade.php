<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Satisfaction Survey</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 0;
            font-size: 16px;
        }
        .content {
            margin: 30px 0;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .message {
            color: #555;
            margin-bottom: 20px;
            line-height: 1.8;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #1d4ed8;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .survey-link {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            word-break: break-all;
        }
        .survey-link p {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
        }
        .survey-link a {
            color: #2563eb;
            text-decoration: none;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .footer p {
            margin: 5px 0;
        }
        .expiry-notice {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .expiry-notice p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
        }
        .benefits {
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .benefits h3 {
            color: #1e40af;
            margin: 0 0 10px 0;
            font-size: 16px;
        }
        .benefits ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .benefits li {
            color: #1e3a8a;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>❤️ We Value Your Feedback</h1>
            <p>{{ $branchName }}</p>
        </div>

        <div class="content">
            <div class="greeting">
                Hello {{ $customer->first_name }},
            </div>

            <div class="message">
                <p>Thank you for choosing us! We hope you had a great experience with our team.</p>
                
                <p>Your feedback is incredibly important to us and helps us improve our service. We would greatly appreciate it if you could take a few minutes to complete our customer satisfaction survey.</p>
            </div>

            <div class="benefits">
                <h3>📋 What to expect:</h3>
                <ul>
                    <li>Takes only 3-5 minutes to complete</li>
                    <li>Rate your overall experience</li>
                    <li>Share what we did well</li>
                    <li>Tell us how we can improve</li>
                </ul>
            </div>

            <div class="button-container">
                <a href="{{ $survey->public_url }}" class="cta-button">
                    ⭐ Take the Survey Now
                </a>
            </div>

            <div class="survey-link">
                <p><strong>Or copy and paste this link into your browser:</strong></p>
                <a href="{{ $survey->public_url }}">{{ $survey->public_url }}</a>
            </div>

            @if($survey->expires_at)
            <div class="expiry-notice">
                <p>⏰ <strong>Please note:</strong> This survey link will expire on {{ $survey->expires_at->format('F j, Y') }}.</p>
            </div>
            @endif

            <div class="message">
                <p>Your honest feedback helps us serve you and our community better. We read every response and use your insights to make meaningful improvements.</p>
                
                <p>Thank you for being a valued customer!</p>
            </div>
        </div>

        <div class="footer">
            <p><strong>{{ $branchName }}</strong></p>
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>If you have any questions, please contact us directly.</p>
        </div>
    </div>
</body>
</html>
