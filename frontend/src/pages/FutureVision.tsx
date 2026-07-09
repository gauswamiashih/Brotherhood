import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Cpu, Eye, Users, Leaf, BarChart3, Database, 
  Search, ArrowUpRight, Flame, Compass
} from 'lucide-react';

interface FutureIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  complexity: 'Horizon 1' | 'Horizon 2' | 'Horizon 3';
  status: 'Concept' | 'In Research' | 'Prototype';
  tag: string;
}

export const FutureVision: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', name: 'All Concepts', icon: Compass },
    { id: 'ai-styling', name: 'AI Styling & Wardrobe', icon: Sparkles },
    { id: 'immersive', name: 'Immersive AR/VR', icon: Eye },
    { id: 'smart-shopping', name: 'Smart Assistants', icon: Cpu },
    { id: 'social-commerce', name: 'Social & Creator', icon: Users },
    { id: 'sustainable', name: 'Eco & Circular', icon: Leaf },
    { id: 'merchant-intel', name: 'Vendor Intelligence', icon: BarChart3 },
    { id: 'infrastructure', name: 'Next-Gen Infrastructure', icon: Database },
  ];

  const ideas: FutureIdea[] = [
    // Category 1: AI Styling & Wardrobe
    {
      id: 'stylist',
      title: 'AI Personal Fashion Stylist',
      description: 'Context-aware conversational stylist matching user body geometry, color palettes, and upcoming events with real-time designer inventories.',
      category: 'ai-styling',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'GenAI'
    },
    {
      id: 'outfit-gen',
      title: 'AI Outfit Generator',
      description: 'Generates high-fidelity visual representations of complete outfits matching selected base garments with local boutique catalog items.',
      category: 'ai-styling',
      complexity: 'Horizon 2',
      status: 'In Research',
      tag: 'Diffusion Models'
    },
    {
      id: 'wardrobe-planner',
      title: 'AI Wardrobe Planner',
      description: 'Analyzes user historical wear patterns and suggests seasonal updates, scheduling outfits based on local weather and calendar events.',
      category: 'ai-styling',
      complexity: 'Horizon 2',
      status: 'Concept',
      tag: 'Smart Wardrobe'
    },
    {
      id: 'mood-shop',
      title: 'AI Mood-Based Shopping',
      description: 'Translates emotional inputs, mood journals, or musical playlists into curated fashion aesthetic recommendations.',
      category: 'ai-styling',
      complexity: 'Horizon 3',
      status: 'Concept',
      tag: 'Affective Computing'
    },
    {
      id: 'occasion-recs',
      title: 'AI Occasion-Based Recommendations',
      description: 'Scans invitation cards or event titles to formulate proper cultural dress codes and tailored local collection lists.',
      category: 'ai-styling',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'NLP'
    },
    {
      id: 'trends-pred',
      title: 'AI Fashion Trends Prediction',
      description: 'Scrapes global social media and runway lookbooks to feed local boutique owners predictive styling trends and stocking suggestions.',
      category: 'ai-styling',
      complexity: 'Horizon 2',
      status: 'In Research',
      tag: 'Predictive Analytics'
    },
    {
      id: 'shopping-companion',
      title: 'AI Shopping Companion',
      description: 'A constant voice-enabled shopping partner providing real-time styling reviews and price-to-value comparisons during navigation.',
      category: 'ai-styling',
      complexity: 'Horizon 2',
      status: 'Concept',
      tag: 'Agentic AI'
    },
    {
      id: 'virtual-closet',
      title: 'AI Virtual Closet',
      description: 'Automatically digitizes physical user garments via single photo uploads, sorting items into a search-optimized wardrobe.',
      category: 'ai-styling',
      complexity: 'Horizon 2',
      status: 'Prototype',
      tag: 'Computer Vision'
    },
    {
      id: 'color-matching',
      title: 'AI Color Matching',
      description: 'Analyzes user skin tones and hair color against classical color theory wheels to suggest palette pairings.',
      category: 'ai-styling',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Computer Vision'
    },
    {
      id: 'body-measurement',
      title: 'AI Body Measurement Assistant',
      description: 'Captures precise body dimensions using dynamic smartphone video feeds to guarantee bespoke tailoring accuracy.',
      category: 'ai-styling',
      complexity: 'Horizon 2',
      status: 'In Research',
      tag: '3D Mesh Processing'
    },
    {
      id: 'size-engine',
      title: 'AI Size Recommendation Engine',
      description: 'Maps physical metrics against historical brand sizing tolerances to recommend optimal clothing cuts.',
      category: 'ai-styling',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Machine Learning'
    },

    // Category 2: Immersive AR/VR
    {
      id: 'try-on',
      title: 'Virtual Try-On',
      description: 'Allows clients to visualize garments draped realistically onto customizable 3D avatar matches of themselves.',
      category: 'immersive',
      complexity: 'Horizon 2',
      status: 'In Research',
      tag: 'AR Core'
    },
    {
      id: 'ar-experience',
      title: 'AR Shopping Experience',
      description: 'Project boutique items onto your physical space or local fitting mirror using advanced spatial depth technology.',
      category: 'immersive',
      complexity: 'Horizon 2',
      status: 'Concept',
      tag: 'WebXR'
    },
    {
      id: '360-viewer',
      title: '360° Interactive Product Viewer',
      description: 'Provides high-resolution volumetric rotational previews of garments, showcasing fine textile fabrics and lining detail.',
      category: 'immersive',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Web3D'
    },
    {
      id: '3d-customizer',
      title: '3D Product Customization',
      description: 'Let users edit colors, embroidery patterns, collar shapes, and button types live on 3D garments prior to ordering.',
      category: 'immersive',
      complexity: 'Horizon 2',
      status: 'Prototype',
      tag: 'WebGL'
    },
    {
      id: 'mr-shopping',
      title: 'Mixed Reality Shopping',
      description: 'Immersive shopping malls and boutique walk-throughs optimized for Apple Vision Pro and Meta Quest headsets.',
      category: 'immersive',
      complexity: 'Horizon 3',
      status: 'Concept',
      tag: 'Spatial UI'
    },
    {
      id: 'digital-shows',
      title: 'Digital Fashion Shows',
      description: 'Attend virtual front-row runway launches for regional Gujarati design boutique releases using immersive streaming.',
      category: 'immersive',
      complexity: 'Horizon 3',
      status: 'In Research',
      tag: 'Virtual Spaces'
    },
    {
      id: 'live-shopping',
      title: 'Live Shopping Events',
      description: 'Interactive live-streams where boutique hosts present clothing lines with instant checkout overlay badges.',
      category: 'immersive',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Video Streaming'
    },
    {
      id: 'hyper-recs',
      title: 'Hyper-Personalized Recommendations',
      description: 'Dynamically adapts the virtual runway layout to emphasize matching silhouettes based on viewing durations.',
      category: 'immersive',
      complexity: 'Horizon 2',
      status: 'In Research',
      tag: 'Deep Learning'
    },

    // Category 3: Smart Assistants
    {
      id: 'smart-assistant',
      title: 'AI Shopping Assistant',
      description: 'Guides customers through checkout workflows, applying optimal coupon combinations automatically.',
      category: 'smart-shopping',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Agentic Workflow'
    },
    {
      id: 'voice-shop',
      title: 'AI Voice Shopping',
      description: 'Enables complete hands-free navigation, item filtering, and cart purchasing using conversational speech recognition.',
      category: 'smart-shopping',
      complexity: 'Horizon 2',
      status: 'Concept',
      tag: 'ASR/TTS'
    },
    {
      id: 'img-search',
      title: 'AI Image Search',
      description: 'Let users upload style snapshots to instantly find identical or structurally similar boutique matches in Palanpur.',
      category: 'smart-shopping',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Vector Search'
    },
    {
      id: 'personalized-home',
      title: 'AI Personalized Home Screen',
      description: 'A dashboard that transforms its themes, layouts, and product placements based on user style profile metrics.',
      category: 'smart-shopping',
      complexity: 'Horizon 2',
      status: 'In Research',
      tag: 'Recommender Systems'
    },
    {
      id: 'smart-notif',
      title: 'AI Smart Notifications',
      description: 'Sends notifications scheduled specifically when styling trends match historical user interaction times.',
      category: 'smart-shopping',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Scheduling Engine'
    },
    {
      id: 'smart-reviews',
      title: 'AI Smart Reviews',
      description: 'Summarizes client review lists into structural highlights, identifying fabric texture and fit pros/cons automatically.',
      category: 'smart-shopping',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'LLM Summary'
    },
    {
      id: 'comparison-assistant',
      title: 'AI Product Comparison Assistant',
      description: 'Generates detailed matrices comparing garment materials, stitch density, and pricing value across boutiques.',
      category: 'smart-shopping',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'LLM Reasoning'
    },
    {
      id: 'cx-intelligence',
      title: 'Customer Experience Intelligence',
      description: 'Monitors client shopping journeys to preemptively flag navigation struggles and suggest resolution options.',
      category: 'smart-shopping',
      complexity: 'Horizon 2',
      status: 'In Research',
      tag: 'Analytics'
    },

    // Category 4: Social & Creator
    {
      id: 'creator-mkt',
      title: 'Creator Marketplace',
      description: 'Enables local design influencers to curate custom capsule collections using marketplace boutique items.',
      category: 'social-commerce',
      complexity: 'Horizon 2',
      status: 'Prototype',
      tag: 'Creator Economy'
    },
    {
      id: 'influencer-hub',
      title: 'Influencer Collaboration Hub',
      description: 'A platform matching micro-influencers directly with boutique owners for campaign contracts and affiliate payouts.',
      category: 'social-commerce',
      complexity: 'Horizon 2',
      status: 'Concept',
      tag: 'Affiliate Ledger'
    },
    {
      id: 'social-shopping',
      title: 'Social Shopping',
      description: 'Co-shop with friends in real-time, sharing synchronized catalog boards, video chats, and split-payment checkout carts.',
      category: 'social-commerce',
      complexity: 'Horizon 3',
      status: 'Concept',
      tag: 'WebRTC'
    },
    {
      id: 'fashion-boards',
      title: 'Community Fashion Boards',
      description: 'Interactive, community-driven mood boards where users share styling arrangements and receive feedback.',
      category: 'social-commerce',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Social Feed'
    },
    {
      id: 'fashion-challenges',
      title: 'Fashion Challenges',
      description: 'Participate in weekly themed styling challenges (e.g. Navratri ensembles) with community voting for reward tokens.',
      category: 'social-commerce',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Gamification'
    },
    {
      id: 'rewards-eco',
      title: 'Loyalty & Rewards Ecosystem',
      description: 'Earn styling tokens redeemable across all Palanpur boutique partners for active community participation.',
      category: 'social-commerce',
      complexity: 'Horizon 2',
      status: 'Prototype',
      tag: 'Token Ledger'
    },

    // Category 5: Eco & Circular
    {
      id: 'nft-collect',
      title: 'Digital Twin NFTs',
      description: 'Receive verified digital wear twins of purchased physical ethnic garments to dress avatars across metaverses.',
      category: 'sustainable',
      complexity: 'Horizon 3',
      status: 'Concept',
      tag: 'Web3 / ERC-1155'
    },
    {
      id: 'carbon-tracking',
      title: 'Carbon Footprint Tracking',
      description: 'Calculates the carbon offset metrics for local clothing sourcing versus importing standard factory garments.',
      category: 'sustainable',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Green Tech'
    },
    {
      id: 'eco-score',
      title: 'Sustainable Fashion Score',
      description: 'Rates clothing pieces based on organic fabric metrics, natural dye techniques, and fair craft artisan compensation.',
      category: 'sustainable',
      complexity: 'Horizon 2',
      status: 'Prototype',
      tag: 'Green Audit'
    },
    {
      id: 'smart-tracking',
      title: 'Smart Delivery Tracking',
      description: 'Calculates delivery times dynamically while tracking hyper-local carbon-neutral courier logistics.',
      category: 'sustainable',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Logistics'
    },

    // Category 6: Vendor Intelligence
    {
      id: 'business-insights',
      title: 'AI Business Insights for Vendors',
      description: 'Aggregates regional traffic patterns to suggest pricing adjustments and design enhancements for catalog listings.',
      category: 'merchant-intel',
      complexity: 'Horizon 2',
      status: 'Prototype',
      tag: 'Business Intelligence'
    },
    {
      id: 'sales-pred',
      title: 'AI Sales Prediction',
      description: 'Utilizes historical seasonal curves to forecast sales volume limits prior to traditional festival periods.',
      category: 'merchant-intel',
      complexity: 'Horizon 2',
      status: 'In Research',
      tag: 'Time-Series Forecasting'
    },
    {
      id: 'inventory-forecast',
      title: 'AI Inventory Forecasting',
      description: 'Suggests fabric and raw material ordering quantities based on predicted customer demand.',
      category: 'merchant-intel',
      complexity: 'Horizon 2',
      status: 'Concept',
      tag: 'Demand Forecasting'
    },
    {
      id: 'fraud-detect',
      title: 'AI Fraud Detection',
      description: 'Identifies fraudulent order transactions and chargebacks using pattern recognition models.',
      category: 'merchant-intel',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Anomaly Detection'
    },
    {
      id: 'marketing-assistant',
      title: 'AI Marketing Assistant',
      description: 'Autonomously drafts promotional emails, Instagram copy, and discount structures for regional clients.',
      category: 'merchant-intel',
      complexity: 'Horizon 2',
      status: 'Prototype',
      tag: 'Agentic Marketing'
    },
    {
      id: 'content-gen',
      title: 'AI Content Generator',
      description: 'Creates photorealistic virtual model display pictures wearing uploaded boutique catalog clothing.',
      category: 'merchant-intel',
      complexity: 'Horizon 3',
      status: 'Concept',
      tag: 'Generative AI'
    },
    {
      id: 'store-optimization',
      title: 'AI Store Optimization',
      description: 'Suggests catalog placement adjustments to maximize user click-through rates on shop profiles.',
      category: 'merchant-intel',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Optimization Algorithms'
    },

    // Category 7: Next-Gen Infrastructure
    {
      id: 'support-agent',
      title: 'AI Customer Support Agent',
      description: 'Context-trained automated customer service agent capable of managing complex order dispute issues.',
      category: 'infrastructure',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'GenAI Support'
    },
    {
      id: 'intl-expansion',
      title: 'International Marketplace Expansion',
      description: 'Cross-border logistics pipelines allowing global clients to order verified Gujarati craft wear.',
      category: 'infrastructure',
      complexity: 'Horizon 3',
      status: 'Concept',
      tag: 'Global Supply Chain'
    },
    {
      id: 'multi-lang',
      title: 'Multi-Language Support',
      description: 'Enables real-time language translations of description parameters into Gujarati, Hindi, and Spanish.',
      category: 'infrastructure',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Localization'
    },
    {
      id: 'multi-currency',
      title: 'Multi-Currency Support',
      description: 'Local checkout pricing conversions supporting dynamic currency matches including USD, GBP, and EUR.',
      category: 'infrastructure',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Fintech Engine'
    },
    {
      id: 'mobile-app',
      title: 'Mobile Application',
      description: 'Bespoke native mobile experiences built for iOS and Android, leveraging native camera sensors for AR features.',
      category: 'infrastructure',
      complexity: 'Horizon 2',
      status: 'Prototype',
      tag: 'React Native'
    },
    {
      id: 'pwa',
      title: 'Progressive Web App (PWA)',
      description: 'Enables quick home-screen installations directly from browsers, reducing network request latency.',
      category: 'infrastructure',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Service Workers'
    },
    {
      id: 'offline-mode',
      title: 'Offline Shopping Mode',
      description: 'Allows clients to browse previously cached catalog lists and draft orders without internet feeds.',
      category: 'infrastructure',
      complexity: 'Horizon 2',
      status: 'Concept',
      tag: 'IndexedDB Offline'
    },
    {
      id: 'analytics-dash',
      title: 'Smart Analytics Dashboard',
      description: 'Real-time metrics charts depicting platform sales performance, user conversions, and retention metrics.',
      category: 'infrastructure',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'Analytics Infrastructure'
    },
    {
      id: 'success-center',
      title: 'Vendor Success Center',
      description: 'An educational resource hub providing masterclasses on couture photography and customer engagement.',
      category: 'infrastructure',
      complexity: 'Horizon 1',
      status: 'Prototype',
      tag: 'E-Learning Portal'
    },
    {
      id: 'developer-platform',
      title: 'API & Developer Platform',
      description: 'Provides secure API access pipelines allowing external clothing retailers to sync inventory records.',
      category: 'infrastructure',
      complexity: 'Horizon 3',
      status: 'Concept',
      tag: 'Public APIs'
    },
    {
      id: 'enterprise-solutions',
      title: 'Enterprise Marketplace Solutions',
      description: 'White-label instances of our platform engineered for large-scale retail conglomerates.',
      category: 'infrastructure',
      complexity: 'Horizon 3',
      status: 'Concept',
      tag: 'SaaS Platform'
    }
  ];

  const filteredIdeas = ideas.filter(idea => {
    const matchesCategory = activeCategory === 'all' || idea.category === activeCategory;
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          idea.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getHorizonColor = (horizon: string) => {
    switch (horizon) {
      case 'Horizon 1': return 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
      case 'Horizon 2': return 'border-amber-500 bg-amber-500/10 text-amber-400';
      case 'Horizon 3': return 'border-purple-500 bg-purple-500/10 text-purple-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Prototype': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'In Research': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Concept': return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black text-white relative overflow-hidden pb-20">
      
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-[10%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-luxury-purpleGlow opacity-25 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-luxury-gold opacity-10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[50%] left-[45%] w-[35vw] h-[35vw] rounded-full bg-purple-600 opacity-15 blur-[130px] pointer-events-none" />

      {/* Header / Intro */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-luxury-gold border-opacity-35 bg-luxury-purpleMid bg-opacity-20 text-[10px] font-bold text-luxury-gold uppercase tracking-widest mb-6"
        >
          <Flame className="w-3.5 h-3.5 text-luxury-gold animate-pulse" />
          <span>COUTURE INNOVATION ROADMAP</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold font-serif tracking-tight leading-tight max-w-4xl mx-auto"
        >
          Discover Palanpur's <br />
          <span className="text-gold-gradient">Future Fashion Vision</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400 font-light mt-6 leading-relaxed"
        >
          Welcome to the Couture Innovation Lab. Explore our long-term research roadmap, featuring 50+ experimental concepts across AI styling, immersive spatial commerce, circular sustainability, and next-generation fashion logistics.
        </motion.p>
      </section>

      {/* Filtering and Search Controls */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="glass-panel p-6 rounded-2xl border border-luxury-border border-opacity-40 flex flex-col gap-6 shadow-glass">
          
          {/* Search bar */}
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search concepts, technologies, or keywords (e.g. AR, Diffusion, NLP)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-luxury-black bg-opacity-70 border border-luxury-border border-opacity-50 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-luxury-gold transition-colors duration-300 text-white placeholder-gray-400"
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    isSelected 
                      ? 'bg-luxury-gold border-luxury-gold text-black shadow-goldGlow' 
                      : 'border-luxury-border border-opacity-40 bg-luxury-purpleDeep bg-opacity-40 text-gray-300 hover:text-white hover:border-luxury-gold hover:border-opacity-60'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-luxury-gold'}`} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Idea Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredIdeas.map((idea) => (
              <motion.div
                layout
                key={idea.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="glass-panel glass-panel-hover p-6 rounded-2xl border border-luxury-border border-opacity-30 flex flex-col justify-between space-y-5 h-64 shadow-glass hover:shadow-goldGlowTiny transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded border ${getHorizonColor(idea.complexity)}`}>
                      {idea.complexity}
                    </span>
                    <span className={`text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(idea.status)}`}>
                      {idea.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-serif tracking-wide group-hover:text-luxury-gold transition-colors pt-4 flex items-center gap-1">
                    {idea.title}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-luxury-gold shrink-0 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  
                  <p className="text-xs text-gray-400 font-light leading-relaxed pt-2 line-clamp-3">
                    {idea.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-luxury-border border-opacity-20 pt-4 mt-auto">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                    Category: {categories.find(c => c.id === idea.category)?.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-luxury-purpleLight text-luxury-gold font-bold font-mono">
                    #{idea.tag}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredIdeas.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 glass-panel rounded-2xl border border-luxury-border border-opacity-30"
          >
            <Sparkles className="w-12 h-12 text-luxury-gold mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold font-serif text-white">No Concepts Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2 leading-relaxed font-light">
              We couldn't find any roadmap ideas matching "{searchQuery}". Try searching for other technologies or terms.
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
};
