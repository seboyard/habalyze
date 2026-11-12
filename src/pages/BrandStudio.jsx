import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Sparkles, Image, Wand2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

import AvatarGenerator from '../components/brandstudio/AvatarGenerator';
import AssetLibrary from '../components/brandstudio/AssetLibrary';
import CanvaPromptGenerator from '../components/brandstudio/CanvaPromptGenerator';

export default function BrandStudioPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50 gap-4">
        <Shield className="w-16 h-16 text-violet-300" />
        <h1 className="text-2xl font-bold text-gray-700">Acceso restringido</h1>
        <p className="text-gray-500">Esta página es solo para administradores.</p>
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="outline">Volver al Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 pb-16">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <Link to={createPageUrl('AdminPanel')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Admin Panel
          </Button>
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Brand Studio
            </h1>
            <p className="text-gray-500 text-sm">Sistema gráfico oficial de Habalyze · Solo administradores</p>
          </div>
        </div>

        <Tabs defaultValue="avatar">
          <TabsList className="grid grid-cols-3 w-full mb-8 bg-white border-2 border-violet-100 p-1 shadow-sm">
            <TabsTrigger value="avatar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white gap-2">
              <Sparkles className="w-4 h-4" /> Generador de Avatar
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white gap-2">
              <Image className="w-4 h-4" /> Biblioteca de Assets
            </TabsTrigger>
            <TabsTrigger value="canva" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white gap-2">
              <Wand2 className="w-4 h-4" /> Prompts para Canva
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avatar">
            <AvatarGenerator />
          </TabsContent>
          <TabsContent value="library">
            <AssetLibrary />
          </TabsContent>
          <TabsContent value="canva">
            <CanvaPromptGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}