import { db } from '@/api/base44Client';
import React, { useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Eye, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import SEO from '../components/common/SEO';

const categoryColors = {
  productividad: 'from-purple-500 to-violet-600',
  habitos: 'from-blue-500 to-cyan-600',
  motivacion: 'from-orange-500 to-amber-600',
  salud: 'from-green-500 to-emerald-600',
  tecnologia: 'from-pink-500 to-rose-600'
};

export default function BlogPostPage() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: posts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => db.entities.BlogPost.filter({ slug, is_published: true }),
    enabled: !!slug,
    staleTime: 300000,
  });

  const post = posts[0];

  const incrementViewMutation = useMutation({
    mutationFn: async (postId) => {
      const currentPost = await db.entities.BlogPost.filter({ id: postId });
      if (currentPost.length > 0) {
        await db.entities.BlogPost.update(postId, {
          views_count: (currentPost[0].views_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-posts']);
    }
  });

  useEffect(() => {
    if (post?.id) {
      incrementViewMutation.mutate(post.id);
    }
  }, [post?.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <SEO 
        title={`${post.title} - Blog Habalyze`}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords?.join(', ')}
      />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Link to={createPageUrl('Blog')}>
          <Button variant="ghost" className="mb-6 hover:bg-purple-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Blog
          </Button>
        </Link>

        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`h-64 bg-gradient-to-br ${categoryColors[post.category]} flex items-center justify-center relative`}>
            <span className="text-9xl">{post.featured_image || '📝'}</span>
            <div className="absolute top-4 left-4">
              <Badge className={`bg-gradient-to-r ${categoryColors[post.category]} text-white`}>
                {post.category}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.published_date), "d 'de' MMMM, yyyy", { locale: es })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.read_time} min de lectura
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views_count} vistas
              </span>
              {post.author_name && (
                <span>Por {post.author_name}</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="ml-auto"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>

            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">{children}</h3>,
                  p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">{children}</ol>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-purple-50 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => <strong className="font-bold text-purple-700">{children}</strong>,
                  a: ({ children, ...props }) => (
                    <a {...props} className="text-purple-600 hover:text-purple-700 underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-500 mb-3">Etiquetas:</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-purple-600 border-purple-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">¿Listo para poner en práctica lo que aprendiste?</h3>
          <p className="text-purple-100 mb-6">Únete a Habalyze y transforma tus hábitos en aventuras épicas</p>
          <Button size="lg" onClick={() => db.auth.redirectToLogin()} className="bg-white text-purple-600 hover:bg-purple-50">
            Comenzar Gratis
          </Button>
        </div>
      </div>
    </div>
  );
}