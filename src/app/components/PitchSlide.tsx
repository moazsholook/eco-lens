import { Sparkles, Target, Zap, TrendingUp, Users, Globe } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

export function PitchSlide() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-purple-100 text-purple-700 mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            UOttaHackathon 2026
          </Badge>
          <h1 className="text-5xl font-bold text-emerald-900 mb-4">EcoLens</h1>
          <p className="text-xl text-emerald-700">
            See the Environmental Cost of Everyday Objects
          </p>
        </div>

        {/* The Problem */}
        <Card className="p-6 mb-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <div className="bg-red-500 p-3 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">The Problem</h2>
              <p className="text-red-800 mb-3">
                Most people are unaware of the true environmental cost of everyday items.
              </p>
              <ul className="space-y-2 text-sm text-red-700">
                <li>• 500 billion disposable cups used annually - less than 1% recycled</li>
                <li>• Average smartphone replaced every 2.5 years, wasting 80kg CO₂ each time</li>
                <li>• Consumers want to make sustainable choices but lack information</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* The Solution */}
        <Card className="p-6 mb-6 border-emerald-200 bg-emerald-50">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-900 mb-2">The Solution</h2>
              <p className="text-emerald-800 mb-3">
                Point your camera at any object and instantly learn its environmental impact.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white p-4 rounded-lg border border-emerald-200">
                  <p className="text-3xl mb-2">📸</p>
                  <p className="font-semibold text-emerald-900 text-sm">Scan Object</p>
                  <p className="text-xs text-emerald-700">AI recognition</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-emerald-200">
                  <p className="text-3xl mb-2">🧮</p>
                  <p className="font-semibold text-emerald-900 text-sm">Calculate Impact</p>
                  <p className="text-xs text-emerald-700">Lifecycle analysis</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-emerald-200">
                  <p className="text-3xl mb-2">🎙️</p>
                  <p className="font-semibold text-emerald-900 text-sm">Hear Narration</p>
                  <p className="text-xs text-emerald-700">Documentary style</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tech Stack */}
        <Card className="p-6 mb-6 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Tech Stack</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="text-2xl mb-2">🤖</p>
                  <p className="font-semibold text-blue-900 mb-1">Google Gemini</p>
                  <p className="text-xs text-blue-700">Vision AI for object ID & impact analysis</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="text-2xl mb-2">🎙️</p>
                  <p className="font-semibold text-blue-900 mb-1">ElevenLabs</p>
                  <p className="text-xs text-blue-700">Documentary-style voice narration</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="text-2xl mb-2">☁️</p>
                  <p className="font-semibold text-blue-900 mb-1">DigitalOcean</p>
                  <p className="text-xs text-blue-700">Backend hosting & database</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Market Opportunity */}
        <Card className="p-6 mb-6 border-purple-200 bg-purple-50">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-900 mb-2">Market Opportunity</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <p className="text-3xl font-bold text-purple-600 mb-1">$12B</p>
                  <p className="text-sm text-purple-700">Sustainable products market (2024)</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <p className="text-3xl font-bold text-purple-600 mb-1">73%</p>
                  <p className="text-sm text-purple-700">Consumers willing to pay more for eco-products</p>
                </div>
              </div>
              <div className="mt-4 bg-white p-4 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-900 mb-2">Revenue Streams</p>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Affiliate links to sustainable alternatives (10-15% commission)</li>
                  <li>• B2B API for retailers & e-commerce platforms</li>
                  <li>• Premium features: carbon tracking, corporate partnerships</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Why We'll Win */}
        <Card className="p-6 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-start gap-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-900 mb-4">Why We'll Win</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-900 mb-1">✨ Visual & Instant</p>
                    <p className="text-xs text-green-700">No typing, no searching - just point & learn</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-900 mb-1">🎯 Actionable</p>
                    <p className="text-xs text-green-700">Provides alternatives, not just data</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-900 mb-1">📱 Mobile-First</p>
                    <p className="text-xs text-green-700">Works at point-of-purchase</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-900 mb-1">🎙️ Engaging</p>
                    <p className="text-xs text-green-700">Documentary narration makes it memorable</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-900 mb-1">📊 Data-Driven</p>
                    <p className="text-xs text-green-700">Real carbon calculations, not guesses</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-900 mb-1">🌍 Viral Potential</p>
                    <p className="text-xs text-green-700">Share-worthy results drive growth</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Impact Vision */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-2">Our Vision</h3>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Make sustainability visible, accessible, and actionable for everyone - 
            one scan at a time.
          </p>
        </div>
      </div>
    </div>
  );
}
