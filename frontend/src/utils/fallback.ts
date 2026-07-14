/**
 * Category-specific luxury image fallbacks for boutiques.
 * Used when a user-uploaded image is empty or fails to load (404 / serverless reset).
 */

export const getCategoryLogo = (category?: string): string => {
  const cat = (category || '').toLowerCase().trim();
  if (cat.includes('men')) {
    return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&h=300&q=80';
  }
  if (cat.includes('women')) {
    return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&h=300&q=80';
  }
  if (cat.includes('kid')) {
    return 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=300&h=300&q=80';
  }
  if (cat.includes('ethnic')) {
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&h=300&q=80';
  }
  if (cat.includes('footwear') || cat.includes('shoe')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=300&q=80';
  }
  if (cat.includes('access')) {
    return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&h=300&q=80';
  }
  // Default luxury boutique logo fallback
  return 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=300&h=300&q=80';
};

export const getCategoryCover = (category?: string): string => {
  const cat = (category || '').toLowerCase().trim();
  if (cat.includes('men')) {
    return 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1200&h=400&q=80';
  }
  if (cat.includes('women')) {
    return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&h=400&q=80';
  }
  if (cat.includes('kid')) {
    return 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=1200&h=400&q=80';
  }
  if (cat.includes('ethnic')) {
    return 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&h=400&q=80';
  }
  if (cat.includes('footwear') || cat.includes('shoe')) {
    return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&h=400&q=80';
  }
  if (cat.includes('access')) {
    return 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&h=400&q=80';
  }
  // Default luxury boutique cover banner
  return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80';
};
