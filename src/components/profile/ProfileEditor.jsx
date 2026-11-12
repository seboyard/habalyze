import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save, User, Lock, AtSign, Loader2, CheckCircle, XCircle, Upload, Heart, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileEditor({ user, open, onOpenChange, onSave }) {
  const [name, setName] = useState(user?.display_name || user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isPrivate, setIsPrivate] = useState(user?.is_private || false);
  const [interests, setInterests] = useState(user?.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || '');
  const [bannerImage, setBannerImage] = useState(user?.banner_image || '');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const availableInterests = [
    'Fitness', 'Lectura', 'Meditación', 'Productividad', 'Nutrición',
    'Yoga', 'Aprendizaje', 'Sueño', 'Mindfulness', 'Finanzas',
    'Creatividad', 'Programación', 'Música', 'Arte', 'Escritura', 'Emprendimiento'
  ];

  useEffect(() => {
    setName(user?.display_name || user?.full_name || '');
    setUsername(user?.username || '');
    setBio(user?.bio || '');
    setIsPrivate(user?.is_private || false);
    setInterests(user?.interests || []);
    setProfilePicture(user?.profile_picture || '');
    setBannerImage(user?.banner_image || '');
  }, [user, open]);

  useEffect(() => {
    if (!username || username === user?.username) {
      setUsernameAvailable(null);
      return;
    }
    
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const users = await db.entities.User.filter({ username: username.toLowerCase() });
        setUsernameAvailable(users.length === 0);
      } catch (e) {
        setUsernameAvailable(null);
      }
      setCheckingUsername(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [username, user?.username]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setProfilePicture(file_url);
      toast.success('Imagen subida');
    } catch (e) {
      toast.error('Error al subir imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setUploadingBanner(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setBannerImage(file_url);
      toast.success('Banner subido');
    } catch (e) {
      toast.error('Error al subir banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const toggleInterest = (interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest].slice(0, 5)
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }
    
    if (username && username !== user?.username && usernameAvailable === false) {
      toast.error('Ese nombre de usuario ya está en uso');
      return;
    }
    
    setSaving(true);
    try {
      const updateData = {
        display_name: name.trim(),
        bio: bio.trim(),
        is_private: isPrivate,
        interests,
        profile_picture: profilePicture,
        banner_image: bannerImage
      };
      
      if (username && username !== user?.username) {
        updateData.username = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
      }
      
      await onSave(updateData);
      toast.success('Perfil actualizado');
      onOpenChange(false);
    } catch (e) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Editar Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Profile Picture */}
          <div>
            <Label>Foto de perfil</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : user?.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-white font-bold">
                    {name?.charAt(0) || user?.full_name?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-image"
                />
                <label htmlFor="profile-image">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="cursor-pointer"
                    asChild
                    disabled={uploadingImage}
                  >
                    <span>
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Subir foto
                    </span>
                  </Button>
                </label>
                {profilePicture && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="ml-2 text-red-500"
                    onClick={() => setProfilePicture('')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="mt-1"
              maxLength={50}
            />
          </div>

          <div>
            <Label htmlFor="username">Nombre de usuario</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="tu_usuario"
                className="pl-8"
                maxLength={20}
              />
              {checkingUsername && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
              {!checkingUsername && usernameAvailable === true && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {!checkingUsername && usernameAvailable === false && (
                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {usernameAvailable === false && (
              <p className="text-xs text-red-500 mt-1">Este nombre de usuario ya está en uso</p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Descripción</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos sobre ti..."
              className="mt-1 h-24"
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1">{bio.length}/200</p>
          </div>

          {/* Banner Image */}
          <div>
            <Label>Banner del perfil</Label>
            <div className="mt-2 space-y-2">
              {bannerImage && (
                <div className="relative w-full h-24 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${bannerImage})` }}>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => setBannerImage('')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                  id="banner-image"
                />
                <label htmlFor="banner-image" className="flex-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full cursor-pointer"
                    asChild
                    disabled={uploadingBanner}
                  >
                    <span>
                      {uploadingBanner ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Subir banner
                    </span>
                  </Button>
                </label>
              </div>
              <Input
                placeholder="O pega una URL de imagen"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              Intereses (max 5)
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableInterests.map(interest => (
                <Badge
                  key={interest}
                  variant={interests.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    interests.includes(interest) 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'hover:bg-purple-50'
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <Card className="p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Perfil Privado</p>
                  <p className="text-xs text-gray-500">Solo amigos pueden ver tu perfil completo</p>
                </div>
              </div>
              <Switch
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
            </div>
          </Card>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}