import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, MessageCircle, Copy, Check, Link2, Users, Mail, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function InviteFriend({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const queryClient = useQueryClient();
  
  const appUrl = window.location.origin;
  
  // Generate unique invitation code
  const generateInviteCode = () => {
    return `${currentUser?.email?.split('@')[0]}_${Date.now().toString(36)}`.toUpperCase();
  };
  
  const [inviteCode] = useState(() => generateInviteCode());
  const referralLink = `${appUrl}?invite=${inviteCode}`;
  
  const generateMessage = () => `Hola!

Te invito a unirte a Habalyze, una app increible para crear habitos y alcanzar tus metas.

Yo soy ${currentUser?.full_name || 'tu amigo'} y me encantaria que nos conectaramos ahi.

* Gana recompensas por completar habitos
* Manten rachas y sube de nivel
* Compite con amigos

Unete con mi link personalizado:
${referralLink}`;

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser?.email) {
      setMessage(generateMessage());
    }
  }, [currentUser?.email, referralLink]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Mensaje copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleTelegram = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encoded}`, '_blank');
  };

  const handleCopyLink = async () => {
    // Create invitation record
    try {
      await db.entities.Invitation.create({
        referrer_email: currentUser.email,
        referrer_name: currentUser.full_name,
        invitation_code: inviteCode,
        status: 'pending',
        method: 'link'
      });
    } catch (e) {
      // Already exists, that's ok
    }
    
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    toast.success('Link de invitación copiado');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const sendEmailInvitation = useMutation({
    mutationFn: async (email) => {
      // Create invitation record
      const invitation = await db.entities.Invitation.create({
        referrer_email: currentUser.email,
        referrer_name: currentUser.full_name,
        invited_email: email,
        invitation_code: inviteCode,
        status: 'pending',
        method: 'email'
      });

      // Send email
      await db.integrations.Core.SendEmail({
        from_name: 'Habalyze',
        to: email,
        subject: `${currentUser.full_name} te invita a Habalyze`,
        body: `Hola!

${currentUser.full_name} te invita a unirte a Habalyze, una aplicación increíble para crear hábitos y alcanzar tus metas.

* Gana recompensas por completar hábitos
* Mantén rachas y sube de nivel
* Compite con amigos

Únete con este link:
${referralLink}

¡Te esperamos! 🚀`
      });

      return invitation;
    },
    onSuccess: () => {
      toast.success('Invitación enviada por email ✉️');
      setEmailRecipient('');
      queryClient.invalidateQueries(['invitations']);
    },
    onError: () => {
      toast.error('Error al enviar la invitación');
    }
  });

  const handleEmailSend = async () => {
    if (!emailRecipient || !emailRecipient.includes('@')) {
      toast.error('Email inválido');
      return;
    }
    sendEmailInvitation.mutate(emailRecipient);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-green-200 text-green-600 hover:bg-green-50">
          <Share2 className="w-4 h-4" />
          Invitar Amigos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-green-600" />
            Invitar a un Amigo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Referral Stats */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Tus Invitaciones</span>
              <Badge className="bg-purple-100 text-purple-700">
                <Users className="w-3 h-3 mr-1" />
                {currentUser?.referral_count || 0} aceptadas
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Gift className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-gray-600">
                <strong>Recompensas:</strong> 100 monedas + 50 XP por cada amigo
              </p>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Tu Link Personalizado</label>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="text-sm bg-gray-50"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="shrink-0"
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Mensaje Personalizable</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-40 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleWhatsApp}
              className="bg-green-500 hover:bg-green-600 gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              onClick={handleTelegram}
              className="bg-blue-500 hover:bg-blue-600 gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Telegram
            </Button>
          </div>

          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar Mensaje'}
          </Button>

          {/* Email Invitation */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Invitar por Email
            </Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@ejemplo.com"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleEmailSend}
                disabled={sendEmailInvitation.isPending}
                className="bg-gradient-to-r from-violet-500 to-purple-500"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Se enviará una invitación personalizada con tu link
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}