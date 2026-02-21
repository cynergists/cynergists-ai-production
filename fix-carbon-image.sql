-- Fix Carbon agent image to use local placeholder instead of Supabase URL

UPDATE portal_available_agents
SET 
    card_media = '[{"type":"image","file":"/images/agents/seo-engine-placeholder.svg"}]',
    product_media = '[{"type":"image","file":"/images/agents/seo-engine-placeholder.svg"}]',
    image_url = '/images/agents/seo-engine-placeholder.svg'
WHERE name = 'Carbon';
