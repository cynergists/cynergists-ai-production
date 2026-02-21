<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="csrf-token" content="{{ csrf_token() }}" />
        <link rel="icon" href="/favicon.png" type="image/png" />

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Pacifico&family=Satisfy&display=swap" rel="stylesheet">

        <title>Cynergists | AI Agents That Work For Your Business</title>
        <meta name="description" content="Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows." />
        <meta name="author" content="Cynergists" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="/" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="/" />
        <meta property="og:title" content="Cynergists | AI Agents That Work For Your Business" />
        <meta property="og:description" content="Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows." />
        <meta property="og:image" content="/og-image.webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta property="og:site_name" content="Cynergists" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="/" />
        <meta name="twitter:title" content="Cynergists | AI Agents That Work For Your Business" />
        <meta name="twitter:description" content="Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows." />
        <meta name="twitter:image" content="/og-image.webp" />

        @verbatim
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Cynergists",
          "url": "/",
          "logo": "/logo.png",
          "description": "Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows.",
          "sameAs": [],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["English"]
          }
        }
        </script>

        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Cynergists Services",
          "itemListElement": [
            {
              "@type": "Service",
              "position": 1,
              "name": "AI Agents",
              "description": "Custom AI agents that take full ownership of revenue, operations, and internal workflows for your business.",
              "provider": {
                "@type": "Organization",
                "name": "Cynergists"
              }
            }
          ]
        }
        </script>

        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Do I need superpowers to use AI Agents?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. You need clear goals and a real workflow. We handle design, deployment, and ongoing tuning. Your team stays in control with defined approvals and guardrails."
              }
            },
            {
              "@type": "Question",
              "name": "How can AI agents help my business?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Cynergists AI agents automate repetitive tasks, enhance customer service with 24/7 support, provide data analysis, and create custom workflow automation to unlock new possibilities for your business."
              }
            },
            {
              "@type": "Question",
              "name": "Are these agents pre-built or custom?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "They are built around your workflows and your tools. Some parts may be reusable patterns, but the deployment is tailored to how your business operates."
              }
            }
          ]
        }
        </script>
        @endverbatim

        <script nowprocket nitro-exclude type="text/javascript" id="sa-dynamic-optimization" data-uuid="e2a8ee08-51ae-4f61-8e20-ff996e248388" src="data:text/javascript;base64,dmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO3NjcmlwdC5zZXRBdHRyaWJ1dGUoIm5vd3Byb2NrZXQiLCAiIik7c2NyaXB0LnNldEF0dHJpYnV0ZSgibml0cm8tZXhjbHVkZSIsICIiKTtzY3JpcHQuc3JjID0gImh0dHBzOi8vZGFzaGJvYXJkLnNlYXJjaGF0bGFzLmNvbS9zY3JpcHRzL2R5bmFtaWNfb3B0aW1pemF0aW9uLmpzIjtzY3JpcHQuc2V0QXR0cmlidXRlKCJkYXRhc2V0LnV1aWQiLCAiZTI4ZWUwOC01MWFlLTRmNjEtOGUyMC1mZjk5NmUyNDgzODgiKTtzY3JpcHQuc2V0QXR0cmlidXRlKCJpZCIsICJzYS1keW5hbWljLW9wdGltaXphdGlvbi1sb2FkZXIiKTtkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7"></script>

    @viteReactRefresh
    @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
