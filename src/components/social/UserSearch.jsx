import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Check, X, Zap, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDebounce } from '../common/useDebounce';
import PixelAvatar from '../avatar/PixelAvatar';

export default function UserSearch({ allUsers, currentUser, friendEmails, pendingRequests, onSendRequest }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Limpiar el término de búsqueda (quitar @ del inicio si existe)
  const cleanSearch = debouncedSearch.trim().replace(/^@/, '').toLowerCase();
  
  const filteredUsers = cleanSearch === '' ? [] : allUsers
    .filter(u => u && u.email)
    .filter(u => {
      if (u.email === currentUser?.email) return false;
      if (friendEmails.includes(u.email)) return false;
      
      const fullName = (u.full_name || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      
      return fullName.includes(cleanSearch) || 
             username.includes(cleanSearch) ||
             email.includes(cleanSearch);
    })
    .sort((a, b) => {
      // Priorizar por coincidencia exacta en username
      const aUsername = (a.username || '').toLowerCase();
      const bUsername = (b.username || '').toLowerCase();
      
      if (aUsername === cleanSearch && bUsername !== cleanSearch) return -1;
      if (aUsername !== cleanSearch && bUsername === cleanSearch) return 1;
      
      if (aUsername.startsWith(cleanSearch) && !bUsername.startsWith(cleanSearch)) return -1;
      if (!aUsername.startsWith(cleanSearch) && bUsername.startsWith(cleanSearch)) return 1;
      
      // Luego por nivel
      return (b.level || 1) - (a.level || 1);
    })
    .slice(0, 20);

  const hasMoreResults = cleanSearch !== '' && allUsers.filter(u => {
    if (!u || !u.email) return false;
    if (u.email === currentUser?.email) return false;
    if (friendEmails.includes(u.email)) return false;
    
    const fullName = (u.full_name || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    
    return fullName.includes(cleanSearch) || 
           username.includes(cleanSearch) ||
           email.includes(cleanSearch);
  }).length > 20;

  const hasPendingRequest = (userEmail) => {
    return pendingRequests.some(req => req.to_user_email === userEmail);
  };

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar por nombre, @usuario o email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          className="pl-10 pr-10 h-12 text-base border-2 focus:border-purple-400"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
        <div className="text-center py-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700">Escribe al menos 2 caracteres para buscar</p>
        </div>
      )}

      <AnimatePresence>
        {debouncedSearch.trim().length >= 2 && showResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {filteredUsers.length === 0 ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200"
              >
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No se encontraron usuarios</p>
                <p className="text-xs text-gray-400 mt-1">Búsqueda: "{debouncedSearch}"</p>
                <p className="text-xs text-gray-400 mt-1">Intenta con nombre completo, @usuario o email</p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">
                    {filteredUsers.length} resultado{filteredUsers.length > 1 ? 's' : ''}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResults(false)}
                    className="text-xs"
                  >
                    Ocultar
                  </Button>
                </div>
                {filteredUsers.map((user, index) => {
                  const isPending = hasPendingRequest(user.email);
                  const isFriend = friendEmails.includes(user.email);
                  
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card className="p-4 hover:shadow-lg transition-all hover:border-purple-300 border-2">
                        <div className="flex items-center gap-3">
                          <Link 
                            to={`${createPageUrl('Profile')}?user=${encodeURIComponent(user.username || user.email)}`}
                            className="flex-shrink-0"
                          >
                            {user.profile_picture ? (
                              <img 
                                src={user.profile_picture} 
                                alt={user.full_name} 
                                className="w-14 h-14 rounded-full object-cover border-2 border-purple-200 hover:border-purple-400 transition-all" 
                              />
                            ) : (
                              <div className="bg-white rounded-full border-2 border-purple-200 hover:border-purple-400 transition-all p-0.5">
                                <PixelAvatar user={user} size="medium" showLevel={false} showCoins={false} />
                              </div>
                            )}
                          </Link>
                          
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={`${createPageUrl('Profile')}?user=${encodeURIComponent(user.username || user.email)}`}
                              className="block"
                            >
                              <h3 className="font-bold text-gray-800 truncate hover:text-purple-600 transition-colors">
                                {user.full_name}
                              </h3>
                              {user.username && (
                                <p className="text-sm text-purple-600 font-medium">@{user.username}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-xs bg-purple-50">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  Nivel {user.level || 1}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-blue-50">
                                  <Zap className="w-3 h-3 mr-1" />
                                  {user.experience || 0} XP
                                </Badge>
                              </div>
                            </Link>
                          </div>

                          <div className="flex-shrink-0">
                            {isPending ? (
                              <Button size="sm" variant="outline" disabled className="min-w-[100px]">
                                <Check className="w-4 h-4 mr-1" />
                                Enviada
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onSendRequest(user);
                                }}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-w-[100px]"
                              >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Agregar
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
                {hasMoreResults && (
                  <p className="text-center text-sm text-gray-500 mt-3 bg-gray-50 py-2 rounded-lg">
                    Mostrando los primeros 20 resultados. Refina tu búsqueda para ver más específicos.
                  </p>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}