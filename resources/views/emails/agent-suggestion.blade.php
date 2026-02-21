<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Agent Suggestion</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #152036;
            color: #fff;
            padding: 20px;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f5f5f5;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .field {
            margin-bottom: 20px;
        }
        .label {
            font-weight: 600;
            color: #152036;
            margin-bottom: 5px;
        }
        .value {
            background: #fff;
            padding: 12px;
            border-radius: 4px;
            border-left: 3px solid #81CA16;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">New Agent Suggestion</h1>
    </div>
    
    <div class="content">
        <div class="field">
            <div class="label">Submitted by:</div>
            <div class="value">{{ $name }}</div>
        </div>

        <div class="field">
            <div class="label">Email:</div>
            <div class="value">{{ $email }}</div>
        </div>

        <div class="field">
            <div class="label">Suggested Agent Name:</div>
            <div class="value"><strong>{{ $agentName }}</strong></div>
        </div>

        <div class="field">
            <div class="label">What should this agent do?</div>
            <div class="value">{{ $description }}</div>
        </div>

        @if(!empty($useCase))
        <div class="field">
            <div class="label">Use Case:</div>
            <div class="value">{{ $useCase }}</div>
        </div>
        @endif

        <div class="footer">
            <p>This suggestion was submitted through the Cynergists AI marketplace.</p>
        </div>
    </div>
</body>
</html>
