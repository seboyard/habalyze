import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Calendar, Clock, Eye, TrendingUp, BookOpen, Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import SEO from '../components/common/SEO';

const categoryColors = {
  productividad: 'from-purple-500 to-violet-600',
  habitos: 'from-blue-500 to-cyan-600',
  motivacion: 'from-orange-500 to-amber-600',
  salud: 'from-green-500 to-emerald-600',
  tecnologia: 'from-pink-500 to-rose-600'
};

const categoryIcons = {
  productividad: TrendingUp,
  habitos: Target,
  motivacion: Sparkles,
  salud: BookOpen,
  tecnologia: Sparkles
};

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => db.entities.BlogPost.filter({ is_published: true }, '-published_date'),
    staleTime: 300000,
    placeholderData: [],
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(posts.map(p => p.category))];
  const featuredPost = posts[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <SEO 
        title="Blog - Habalyze"
        description="Aprende sobre hábitos, productividad, desarrollo personal y gamificación con nuestros artículos especializados."
        keywords="blog hábitos, productividad, desarrollo personal, motivación, gamificación"
      />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Landing')}>
            <Button variant="ghost" className="mb-4 hover:bg-purple-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Blog Habalyze
              </h1>
              <p className="text-gray-600 mt-2">Guías, consejos y estrategias para transformar tus hábitos</p>
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link to={createPageUrl(`BlogPost?slug=${featuredPost.slug}`)}>
              <Card className="overflow-hidden bg-white hover:shadow-2xl transition-all cursor-pointer border-2 border-purple-100">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`h-64 md:h-full bg-gradient-to-br ${categoryColors[featuredPost.category]} flex items-center justify-center`}>
                    <span className="text-8xl">{featuredPost.featured_image || '📚'}</span>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <Badge className={`bg-gradient-to-r ${categoryColors[featuredPost.category]} text-white w-fit mb-3`}>
                      Destacado
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3 hover:text-purple-600 transition">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(featuredPost.published_date), 'd MMM yyyy', { locale: es })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.read_time} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {featuredPost.views_count}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar artículos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
                size="sm"
              >
                {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.slice(1).map((post, index) => {
              const Icon = categoryIcons[post.category] || BookOpen;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={createPageUrl(`BlogPost?slug=${post.slug}`)}>
                    <Card className="h-full hover:shadow-xl transition-all cursor-pointer overflow-hidden bg-white border border-gray-100 group">
                      <div className={`h-48 bg-gradient-to-br ${categoryColors[post.category]} flex items-center justify-center relative overflow-hidden`}>
                        <span className="text-6xl group-hover:scale-110 transition-transform">{post.featured_image || '📝'}</span>
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs">
                            <Icon className="w-3 h-3 mr-1" />
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(post.published_date), 'd MMM', { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.read_time} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views_count}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredPosts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron artículos</p>
          </div>
        )}
      </div>
    </div>
  );
}